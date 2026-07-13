"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import ProtectedRoute from "@/components/auth/protected-route";
import AppLayout from "@/components/layout/app-layout";
import PracticeQuestionCard from "@/components/interview-question/practice-question-card";
import PracticeSessionSummary, {
    type SessionResult,
} from "@/components/interview-question/practice-session-summary";
import EmptyState from "@/components/shared/empty-state";
import QueryError from "@/components/shared/query-error";
import { useInterviewProcess } from "@/hooks/use-interview-process";
import { useInterviewRound } from "@/hooks/use-interview-round";
import { useQuestionsByRound } from "@/hooks/use-interview-question";
import { getRoundProcessId } from "@/types/interview-round";
import type { InterviewAnswer } from "@/types/interview-answer";
import type { QuestionDifficulty } from "@/types/interview-question";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function PracticeContent({
    processId,
    roundId,
}: {
    processId: string;
    roundId: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isSession = searchParams.get("session") === "1";
    const sessionCount = Number(searchParams.get("count") || "0");
    const sessionDifficulty = searchParams.get(
        "difficulty"
    ) as QuestionDifficulty | null;
    const sessionBookmarked = searchParams.get("bookmarked") === "1";

    const { data: processData, isLoading: processLoading } =
        useInterviewProcess(processId);
    const {
        data: roundData,
        isLoading: roundLoading,
        isError: roundError,
        error: roundErrorData,
        refetch: refetchRound,
    } = useInterviewRound(roundId);
    const {
        data: questionsData,
        isLoading: questionsLoading,
        isError: questionsError,
        error: questionsErrorData,
        refetch: refetchQuestions,
    } = useQuestionsByRound(roundId, { includeFollowUps: true });

    const [index, setIndex] = useState(0);
    const [revealedById, setRevealedById] = useState<
        Record<string, boolean>
    >({});
    const [sessionResults, setSessionResults] = useState<
        Record<string, SessionResult>
    >({});
    const [sessionComplete, setSessionComplete] = useState(false);

    const process = processData?.interviewProcess;
    const round = roundData?.interviewRound;

    const rootQuestions = useMemo(() => {
        let pool = (questionsData?.questions ?? []).filter(
            (q) => !q.isFollowUp
        );
        if (isSession) {
            if (sessionDifficulty) {
                pool = pool.filter((q) => q.difficulty === sessionDifficulty);
            }
            if (sessionBookmarked) {
                pool = pool.filter((q) => q.isBookmarked);
            }
            const n =
                sessionCount > 0
                    ? Math.min(sessionCount, pool.length)
                    : pool.length;
            pool = pool.slice(0, n);
        }
        return pool;
    }, [
        questionsData?.questions,
        isSession,
        sessionCount,
        sessionDifficulty,
        sessionBookmarked,
    ]);

    const followUpsByParent = useMemo(() => {
        const all = questionsData?.questions ?? [];
        const map: Record<string, typeof all> = {};
        for (const q of all) {
            if (q.isFollowUp && q.parentQuestion) {
                const key = q.parentQuestion;
                if (!map[key]) map[key] = [];
                map[key].push(q);
            }
        }
        return map;
    }, [questionsData?.questions]);

    const total = rootQuestions.length;
    const safeIndex = total === 0 ? 0 : Math.min(index, total - 1);
    const current = rootQuestions[safeIndex];
    const practicedCount = rootQuestions.filter(
        (q) => q.status === "Practiced" || q.status === "Completed"
    ).length;

    const canAdvanceSession =
        !isSession ||
        Boolean(sessionResults[current?._id ?? ""]?.evaluation) ||
        Boolean(sessionResults[current?._id ?? ""]?.skipped);

    function recordEvaluation(answer: InterviewAnswer) {
        if (!current) return;
        setSessionResults((prev) => ({
            ...prev,
            [current._id]: {
                question: current,
                evaluation: answer,
                skipped: false,
            },
        }));
    }

    function skipQuestion() {
        if (!current || !isSession) return;
        setSessionResults((prev) => ({
            ...prev,
            [current._id]: {
                question: current,
                evaluation: null,
                skipped: true,
            },
        }));
        goNext();
    }

    function goNext() {
        if (safeIndex >= total - 1) {
            if (isSession) {
                setSessionComplete(true);
            }
            return;
        }
        setIndex((prev) => Math.min(total - 1, prev + 1));
    }

    function goPrev() {
        setIndex((prev) => Math.max(0, prev - 1));
    }

    function finishSessionEarly() {
        // Mark remaining as skipped for summary completeness
        setSessionResults((prev) => {
            const next = { ...prev };
            for (const q of rootQuestions) {
                if (!next[q._id]) {
                    next[q._id] = {
                        question: q,
                        evaluation: null,
                        skipped: true,
                    };
                }
            }
            return next;
        });
        setSessionComplete(true);
    }

    if (processLoading || roundLoading || questionsLoading) {
        return (
            <div className="space-y-4" aria-busy="true">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const belongsToProcess =
        round && getRoundProcessId(round) === processId;

    if (roundError || !round || !belongsToProcess) {
        return (
            <QueryError
                error={roundErrorData}
                message="Interview round not found."
                onRetry={() => refetchRound()}
            />
        );
    }

    if (questionsError) {
        return (
            <QueryError
                error={questionsErrorData}
                onRetry={() => refetchQuestions()}
            />
        );
    }

    if (total === 0) {
        return (
            <EmptyState
                title="Generate questions first"
                description="This round has no matching questions for this session. Adjust filters or generate questions."
                actionHref={`/interviews/${processId}/rounds/${roundId}`}
                actionLabel="Go to round"
            />
        );
    }

    if (isSession && sessionComplete) {
        const orderedResults = rootQuestions.map(
            (q) =>
                sessionResults[q._id] ?? {
                    question: q,
                    evaluation: null,
                    skipped: true,
                }
        );

        return (
            <>
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Practice session complete
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {round.title}
                    </p>
                </header>
                <PracticeSessionSummary
                    results={orderedResults}
                    onRestart={() => {
                        setSessionResults({});
                        setSessionComplete(false);
                        setIndex(0);
                        setRevealedById({});
                    }}
                    onExit={() =>
                        router.push(
                            `/interviews/${processId}/rounds/${roundId}`
                        )
                    }
                />
            </>
        );
    }

    return (
        <>
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                        {isSession ? "Practice session" : "Practice"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {round.title}
                        {process
                            ? ` · ${process.role} at ${process.company}`
                            : ""}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {isSession ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={finishSessionEarly}
                        >
                            End session
                        </Button>
                    ) : null}
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/interviews/${processId}/rounds/${roundId}`}
                        >
                            Back to round
                        </Link>
                    </Button>
                </div>
            </header>

            <div
                className="mb-6 space-y-3"
                aria-label="Practice progress"
            >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <p aria-live="polite">
                        Question{" "}
                        <span className="font-medium text-foreground">
                            {safeIndex + 1}
                        </span>{" "}
                        of {total}
                    </p>
                    <p>
                        {isSession ? "Answered" : "Practiced"}{" "}
                        <span className="font-medium text-foreground">
                            {isSession
                                ? Object.values(sessionResults).filter(
                                      (r) => r.evaluation || r.skipped
                                  ).length
                                : practicedCount}
                        </span>{" "}
                        of {total}
                    </p>
                </div>

                <div
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuemin={1}
                    aria-valuemax={total}
                    aria-valuenow={safeIndex + 1}
                    aria-label={`Question ${safeIndex + 1} of ${total}`}
                >
                    <div
                        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                        style={{
                            width: `${((safeIndex + 1) / total) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {current ? (
                <PracticeQuestionCard
                    key={current._id}
                    roundId={roundId}
                    question={current}
                    followUps={followUpsByParent[current._id] ?? []}
                    revealed={Boolean(revealedById[current._id])}
                    onReveal={() =>
                        setRevealedById((prev) => ({
                            ...prev,
                            [current._id]: true,
                        }))
                    }
                    onEvaluated={recordEvaluation}
                    sessionMode={isSession}
                />
            ) : null}

            <nav
                className="mt-6 flex flex-wrap items-center justify-between gap-4"
                aria-label="Question navigation"
            >
                <Button
                    type="button"
                    variant="outline"
                    disabled={safeIndex <= 0}
                    onClick={goPrev}
                >
                    Previous
                </Button>

                <div className="flex flex-wrap gap-2">
                    {isSession && !canAdvanceSession ? (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={skipQuestion}
                        >
                            Skip
                        </Button>
                    ) : null}

                    <Button
                        type="button"
                        variant="outline"
                        disabled={
                            isSession
                                ? !canAdvanceSession
                                : safeIndex >= total - 1
                        }
                        onClick={goNext}
                    >
                        {isSession && safeIndex >= total - 1
                            ? "Finish session"
                            : "Next"}
                    </Button>
                </div>
            </nav>
        </>
    );
}

export default function PracticePage() {
    const params = useParams<{ id: string; roundId: string }>();

    return (
        <ProtectedRoute>
            <AppLayout title="Practice">
                <Suspense
                    fallback={
                        <div className="space-y-4" aria-busy="true">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    }
                >
                    <PracticeContent
                        processId={params.id}
                        roundId={params.roundId}
                    />
                </Suspense>
            </AppLayout>
        </ProtectedRoute>
    );
}
