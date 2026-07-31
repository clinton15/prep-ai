"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/protected-route";
import AppLayout from "@/components/layout/app-layout";
import InterviewRoundForm from "@/components/interview-round/interview-round-form";
import { ArchiveInterviewRoundButton } from "@/components/interview-round/archive-interview-round-dialog";
import GenerateQuestionsPanel from "@/components/interview-question/generate-questions-panel";
import InterviewQuestionFilters from "@/components/interview-question/interview-question-filters";
import InterviewQuestionList from "@/components/interview-question/interview-question-list";
import StartPracticeSessionDialog from "@/components/interview-question/start-practice-session-dialog";
import QueryError from "@/components/shared/query-error";
import { useInterviewProcess } from "@/hooks/use-interview-process";
import {
    useInterviewRound,
    useUpdateInterviewRound,
} from "@/hooks/use-interview-round";
import { useQuestionsByRound } from "@/hooks/use-interview-question";
import {
    toUpdateRoundPayload,
    type UpdateInterviewRoundFormValues,
} from "@/lib/validations/interview-round";
import { getRoundProcessId } from "@/types/interview-round";
import type {
    InterviewQuestion,
    QuestionFilters,
} from "@/types/interview-question";
import type { ApiError } from "@/types/api-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Hard: 3 } as const;

function applyQuestionFilters(
    questions: InterviewQuestion[],
    filters: QuestionFilters
) {
    let result = [...questions];

    if (filters.includeFollowUps === false) {
        result = result.filter((q) => !q.isFollowUp);
    }

    if (filters.topic) {
        result = result.filter(
            (q) => q.topic.toLowerCase() === filters.topic!.toLowerCase()
        );
    }

    if (filters.difficulty) {
        result = result.filter((q) => q.difficulty === filters.difficulty);
    }

    if (filters.status) {
        result = result.filter((q) => q.status === filters.status);
    }

    if (filters.bookmarked) {
        result = result.filter((q) => q.isBookmarked);
    }

    if (filters.search) {
        const needle = filters.search.toLowerCase();
        result = result.filter((q) =>
            q.question.toLowerCase().includes(needle)
        );
    }

    const direction = filters.order === "desc" ? -1 : 1;
    const sort = filters.sort ?? "order";

    result.sort((a, b) => {
        if (sort === "difficulty") {
            return (
                (DIFFICULTY_RANK[a.difficulty] -
                    DIFFICULTY_RANK[b.difficulty]) *
                direction
            );
        }
        if (sort === "topic") {
            return a.topic.localeCompare(b.topic) * direction;
        }
        if (sort === "status") {
            return a.status.localeCompare(b.status) * direction;
        }
        if (sort === "createdAt") {
            return (
                (new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()) *
                direction
            );
        }
        return (a.order - b.order) * direction;
    });

    return result;
}

function EditRoundContent({
    processId,
    roundId,
}: {
    processId: string;
    roundId: string;
}) {
    const router = useRouter();
    const [filters, setFilters] = useState<QuestionFilters>({
        sort: "order",
        order: "asc",
        includeFollowUps: true,
    });
    const [sessionOpen, setSessionOpen] = useState(false);

    const {
        data: processData,
        isLoading: processLoading,
    } = useInterviewProcess(processId);
    const {
        data: roundData,
        isLoading: roundLoading,
        isError,
        error,
        refetch: refetchRound,
    } = useInterviewRound(roundId);
    const updateMutation = useUpdateInterviewRound(roundId);
    const {
        data: questionsData,
        isLoading: questionsLoading,
        isError: questionsError,
        error: questionsErrorData,
        refetch: refetchQuestions,
    } = useQuestionsByRound(roundId, {
        includeFollowUps: true,
        sort: "order",
        order: "asc",
    });

    const process = processData?.interviewProcess;
    const round = roundData?.interviewRound;
    const allQuestions = useMemo(
        () => questionsData?.questions ?? [],
        [questionsData?.questions]
    );
    const questions = useMemo(
        () => applyQuestionFilters(allQuestions, filters),
        [allQuestions, filters]
    );
    const topics = useMemo(
        () => allQuestions.map((q) => q.topic),
        [allQuestions]
    );
    const rootQuestions = useMemo(
        () => allQuestions.filter((q) => !q.isFollowUp),
        [allQuestions]
    );
    const rootQuestionCount = rootQuestions.length;

    function handleSubmit(values: UpdateInterviewRoundFormValues) {
        updateMutation.mutate(toUpdateRoundPayload(values), {
            onSuccess: (response) => {
                toast.success(
                    response.message ?? "Interview round updated"
                );
            },
            onError: (err: ApiError) => {
                toast.error(
                    err.response?.data?.message ??
                        "Failed to update interview round"
                );
            },
        });
    }

    if (processLoading || roundLoading) {
        return (
            <div className="space-y-4" aria-busy="true">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full max-w-xl" />
            </div>
        );
    }

    const belongsToProcess =
        round && getRoundProcessId(round) === processId;

    if (isError || !round || !belongsToProcess) {
        return (
            <QueryError
                error={error}
                message="Interview round not found."
                onRetry={() => refetchRound()}
            />
        );
    }

    const readOnly = Boolean(process?.isArchived || round.isArchived);

    return (
        <>
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                            {round.title}
                        </h1>
                        <Badge variant="secondary">{round.roundType}</Badge>
                        <Badge variant="outline">{round.status}</Badge>
                    </div>
                    {process ? (
                        <p className="text-sm text-muted-foreground">
                            {process.role} at {process.company}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/interviews/${processId}`}>Back</Link>
                    </Button>

                    {!readOnly ? (
                        <ArchiveInterviewRoundButton
                            roundId={round._id}
                            title={round.title}
                            onArchived={() =>
                                router.replace(`/interviews/${processId}`)
                            }
                        />
                    ) : null}
                </div>
            </header>

            {readOnly ? (
                <p className="mb-8 rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    This round cannot be edited because it or its process is
                    archived.
                </p>
            ) : (
                <Card className="mb-8 max-w-xl">
                    <CardHeader className="border-b [.border-b]:pb-4">
                        <CardTitle className="text-sm font-medium">
                            Round details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <InterviewRoundForm
                            mode="edit"
                            round={round}
                            onSubmit={handleSubmit}
                            isSubmitting={updateMutation.isPending}
                        />
                    </CardContent>
                </Card>
            )}

            <section aria-labelledby="round-questions">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2
                            id="round-questions"
                            className="text-base font-semibold tracking-tight"
                        >
                            Questions
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Generate AI questions for this round, then practice
                            them.
                        </p>
                    </div>

                    {!questionsLoading && rootQuestionCount > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setSessionOpen(true)}
                            >
                                Start practice session
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link
                                    href={`/interviews/${processId}/rounds/${roundId}/practice`}
                                >
                                    Free practice
                                </Link>
                            </Button>
                        </div>
                    ) : null}
                </div>

                <div className="mb-6">
                    <GenerateQuestionsPanel
                        roundId={roundId}
                        processId={processId}
                        hasQuestions={
                            !questionsLoading && rootQuestionCount > 0
                        }
                        disabled={readOnly || questionsLoading}
                        initialJobDescription={process?.jobDescription ?? ""}
                        initialResumeText={process?.resumeText ?? ""}
                    />
                </div>

                {!questionsLoading && allQuestions.length > 0 ? (
                    <InterviewQuestionFilters
                        topics={topics}
                        filters={filters}
                        onChange={setFilters}
                    />
                ) : null}

                {questionsError ? (
                    <QueryError
                        error={questionsErrorData}
                        onRetry={() => refetchQuestions()}
                    />
                ) : (
                    <InterviewQuestionList
                        roundId={roundId}
                        questions={questions}
                        allQuestionsCount={allQuestions.length}
                        isLoading={questionsLoading}
                        isError={false}
                        readOnly={readOnly}
                    />
                )}
            </section>

            <StartPracticeSessionDialog
                open={sessionOpen}
                onOpenChange={setSessionOpen}
                processId={processId}
                roundId={roundId}
                questions={rootQuestions}
            />
        </>
    );
}

export default function EditInterviewRoundPage() {
    const params = useParams<{ id: string; roundId: string }>();

    return (
        <ProtectedRoute>
            <AppLayout title="Edit Round">
                <EditRoundContent
                    processId={params.id}
                    roundId={params.roundId}
                />
            </AppLayout>
        </ProtectedRoute>
    );
}
