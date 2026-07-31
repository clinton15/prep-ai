"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import {
    useAnswerByQuestion,
    useEvaluateAnswer,
} from "@/hooks/use-interview-answer";
import {
    useGenerateFollowUps,
    useExpectedAnswer,
    useUpdateQuestion,
} from "@/hooks/use-interview-question";
import {
    evaluateAnswerSchema,
    toEvaluateAnswerPayload,
    type EvaluateAnswerFormValues,
} from "@/lib/validations/interview-answer";
import { toastAiError } from "@/lib/toast-ai-error";
import type { InterviewAnswer } from "@/types/interview-answer";
import type { InterviewQuestion } from "@/types/interview-question";
import type { ApiError } from "@/types/api-error";

import LoadingButton from "@/components/shared/loading-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

interface PracticeQuestionCardProps {
    roundId: string;
    question: InterviewQuestion;
    followUps: InterviewQuestion[];
    revealed: boolean;
    onReveal: () => void;
    onEvaluated?: (answer: InterviewAnswer) => void;
    sessionMode?: boolean;
}

/**
 * Single practice card: answer → evaluate → follow-ups / notes / complete.
 * Parent should remount with key={question._id} when navigating questions.
 */
export default function PracticeQuestionCard({
    roundId,
    question,
    followUps,
    revealed,
    onReveal,
    onEvaluated,
    sessionMode = false,
}: PracticeQuestionCardProps) {
    const evaluateMutation = useEvaluateAnswer(roundId);
    const updateMutation = useUpdateQuestion(roundId);
    const followUpMutation = useGenerateFollowUps(roundId);
    const { data: priorAnswerData, isLoading: priorLoading } =
        useAnswerByQuestion(question._id);
    const {
        data: expectedAnswerData,
        isLoading: expectedAnswerLoading,
        isError: expectedAnswerError,
        error: expectedAnswerErrorData,
    } = useExpectedAnswer(question._id, revealed);

    const [sessionEvaluation, setSessionEvaluation] =
        useState<InterviewAnswer | null>(null);
    const [notes, setNotes] = useState(question.notes ?? "");

    const evaluation = sessionEvaluation ?? priorAnswerData?.answer ?? null;

    const form = useForm<EvaluateAnswerFormValues>({
        resolver: zodResolver(evaluateAnswerSchema),
        defaultValues: {
            answer: "",
        },
        values: {
            answer:
                sessionEvaluation?.answer ??
                priorAnswerData?.answer?.answer ??
                "",
        },
    });

    function onSubmit(values: EvaluateAnswerFormValues) {
        evaluateMutation.mutate(
            toEvaluateAnswerPayload(question._id, values),
            {
                onSuccess: (data) => {
                    toast.success(data.message ?? "Answer evaluated");
                    setSessionEvaluation(data.answer);
                    onEvaluated?.(data.answer);
                },
                onError: (error: ApiError) => {
                    toastAiError(error, {
                        fallback: "Failed to evaluate answer",
                        onRetry: () => onSubmit(values),
                    });
                },
            }
        );
    }

    const [unbookmarkOpen, setUnbookmarkOpen] = useState(false);

    function toggleBookmark() {
        if (question.isBookmarked) {
            setUnbookmarkOpen(true);
            return;
        }

        updateMutation.mutate(
            {
                questionId: question._id,
                data: { isBookmarked: true },
            },
            {
                onSuccess: () => toast.success("Question bookmarked"),
                onError: (error: ApiError) => {
                    toast.error(
                        error.response?.data?.message ??
                            "Failed to update bookmark"
                    );
                },
            }
        );
    }

    function confirmUnbookmark() {
        updateMutation.mutate(
            {
                questionId: question._id,
                data: { isBookmarked: false },
            },
            {
                onSuccess: () => {
                    toast.success("Bookmark removed");
                    setUnbookmarkOpen(false);
                },
                onError: (error: ApiError) => {
                    toast.error(
                        error.response?.data?.message ??
                            "Failed to update bookmark"
                    );
                },
            }
        );
    }

    function saveNotes() {
        updateMutation.mutate(
            {
                questionId: question._id,
                data: { notes },
            },
            {
                onSuccess: () => toast.success("Notes saved"),
                onError: (error: ApiError) => {
                    toast.error(
                        error.response?.data?.message ??
                            "Failed to save notes"
                    );
                },
            }
        );
    }

    function markCompleted() {
        updateMutation.mutate(
            {
                questionId: question._id,
                data: { status: "Completed" },
            },
            {
                onSuccess: () => toast.success("Marked as completed"),
                onError: (error: ApiError) => {
                    toast.error(
                        error.response?.data?.message ??
                            "Failed to update status"
                    );
                },
            }
        );
    }

    function handleGenerateFollowUps() {
        followUpMutation.mutate(question._id, {
            onSuccess: (data) => {
                toast.success(
                    data.message ??
                        `Generated ${data.questions.length} follow-ups`
                );
            },
            onError: (error: ApiError) => {
                toastAiError(error, {
                    fallback: "Failed to generate follow-ups",
                    onRetry: () => handleGenerateFollowUps(),
                });
            },
        });
    }

    if (priorLoading && !evaluation) {
        return (
            <div
                className="space-y-4 rounded-xl border bg-card p-4 sm:p-6"
                aria-busy="true"
                aria-label="Loading practice question"
            >
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    return (
        <article className="space-y-6 rounded-xl border bg-card p-4 shadow-xs sm:p-6">
            <header className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex size-5 items-center justify-center rounded-md bg-muted text-[10px] font-medium tabular-nums text-muted-foreground">
                        {question.order}
                    </span>
                    <Badge variant="secondary">{question.topic}</Badge>
                    <Badge variant="outline">{question.difficulty}</Badge>
                    <Badge variant="outline">{question.status}</Badge>
                    {question.isFollowUp ? (
                        <Badge variant="outline">Follow-up</Badge>
                    ) : null}

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="ml-auto"
                        aria-label={
                            question.isBookmarked
                                ? "Remove bookmark"
                                : "Bookmark question"
                        }
                        aria-pressed={question.isBookmarked}
                        disabled={updateMutation.isPending}
                        onClick={toggleBookmark}
                    >
                        {question.isBookmarked ? (
                            <BookmarkCheck />
                        ) : (
                            <Bookmark />
                        )}
                    </Button>
                </div>

                <h2 className="text-base font-semibold leading-snug tracking-tight sm:text-lg">
                    {question.question}
                </h2>
            </header>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                >
                    <FormField
                        control={form.control}
                        name="answer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your answer</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="min-h-32"
                                        placeholder="Write your answer here..."
                                        disabled={evaluateMutation.isPending}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-wrap gap-2">
                        <LoadingButton
                            type="submit"
                            loading={evaluateMutation.isPending}
                        >
                            {evaluation
                                ? "Re-evaluate answer"
                                : "Submit for evaluation"}
                        </LoadingButton>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onReveal}
                            disabled={revealed || expectedAnswerLoading}
                        >
                            {revealed
                                ? expectedAnswerLoading
                                    ? "Loading expected answer..."
                                    : "Expected answer shown"
                                : "Reveal expected answer"}
                        </Button>

                        {question.status !== "Completed" ? (
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={updateMutation.isPending}
                                onClick={markCompleted}
                            >
                                Mark completed
                            </Button>
                        ) : null}
                    </div>
                </form>
            </Form>

            {revealed ? (
                <section
                    className="rounded-xl bg-muted/50 p-4 animate-fade-in"
                    aria-label="Expected answer"
                >
                    <h3 className="mb-2 text-sm font-medium">
                        Expected answer
                    </h3>
                    {expectedAnswerLoading ? (
                        <Skeleton className="h-20 w-full" />
                    ) : expectedAnswerError ? (
                        <p className="text-sm text-destructive">
                            {expectedAnswerErrorData?.response?.data
                                ?.message ??
                                "Failed to load expected answer"}
                        </p>
                    ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                            {expectedAnswerData?.expectedAnswer}
                        </p>
                    )}
                </section>
            ) : null}

            {evaluation ? (
                <EvaluationResult evaluation={evaluation} />
            ) : null}

            <section className="space-y-3" aria-label="Notes">
                <h3 className="text-sm font-medium">Your notes</h3>
                <Textarea
                    className="min-h-20"
                    placeholder="Add personal notes for this question..."
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    disabled={updateMutation.isPending}
                />
                <LoadingButton
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={updateMutation.isPending}
                    onClick={saveNotes}
                >
                    Save notes
                </LoadingButton>
            </section>

            {!sessionMode && !question.isFollowUp ? (
                <section className="space-y-3" aria-label="Follow-up questions">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-medium">
                            Follow-up questions
                        </h3>
                        {followUps.length === 0 ? (
                            <LoadingButton
                                type="button"
                                variant="outline"
                                size="sm"
                                loading={followUpMutation.isPending}
                                onClick={handleGenerateFollowUps}
                            >
                                Generate follow-up questions
                            </LoadingButton>
                        ) : null}
                    </div>

                    {followUps.length > 0 ? (
                        <ul className="space-y-2">
                            {followUps.map((item) => (
                                <li
                                    key={item._id}
                                    className="rounded-lg border bg-muted/20 px-3 py-2 text-sm"
                                >
                                    <div className="mb-1 flex flex-wrap gap-1.5">
                                        <Badge variant="outline">
                                            {item.difficulty}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {item.status}
                                        </Badge>
                                    </div>
                                    {item.question}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Generate deeper technical, scenario, and interviewer
                            follow-ups for this question.
                        </p>
                    )}
                </section>
            ) : null}

            <Dialog open={unbookmarkOpen} onOpenChange={setUnbookmarkOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove bookmark?</DialogTitle>
                        <DialogDescription>
                            This question will no longer appear in your
                            bookmarked filter.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setUnbookmarkOpen(false)}
                        >
                            Cancel
                        </Button>
                        <LoadingButton
                            type="button"
                            loading={updateMutation.isPending}
                            onClick={confirmUnbookmark}
                        >
                            Remove bookmark
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </article>
    );
}

function EvaluationResult({
    evaluation,
}: {
    evaluation: InterviewAnswer;
}) {
    return (
        <section
            className="space-y-4 rounded-xl border bg-muted/20 p-4 animate-fade-up"
            aria-label="Evaluation result"
        >
            <div className="flex flex-wrap items-baseline gap-4">
                <div>
                    <h3 className="text-sm font-medium">Overall</h3>
                    <p className="text-2xl font-semibold tracking-tight tabular-nums">
                        {evaluation.score}
                        <span className="text-sm font-normal text-muted-foreground">
                            /10
                        </span>
                    </p>
                </div>

                {evaluation.technicalScore != null ? (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Technical
                        </h3>
                        <p className="text-lg font-semibold tabular-nums">
                            {evaluation.technicalScore}
                            <span className="text-sm font-normal text-muted-foreground">
                                /10
                            </span>
                        </p>
                    </div>
                ) : null}

                {evaluation.communicationScore != null ? (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Communication
                        </h3>
                        <p className="text-lg font-semibold tabular-nums">
                            {evaluation.communicationScore}
                            <span className="text-sm font-normal text-muted-foreground">
                                /10
                            </span>
                        </p>
                    </div>
                ) : null}
            </div>

            {evaluation.feedback ? (
                <div>
                    <h4 className="mb-1 text-sm font-medium">Feedback</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {evaluation.feedback}
                    </p>
                </div>
            ) : null}

            {evaluation.strengths?.length ? (
                <div>
                    <h4 className="mb-1 text-sm font-medium">Strengths</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {evaluation.strengths.map((item, i) => (
                            <li key={`strength-${i}`}>{item}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {evaluation.missingConcepts?.length ? (
                <div>
                    <h4 className="mb-1 text-sm font-medium">
                        Missing concepts
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {evaluation.missingConcepts.map((item, i) => (
                            <li key={`missing-${i}`}>{item}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {evaluation.improvements?.length ? (
                <div>
                    <h4 className="mb-1 text-sm font-medium">
                        Improvements
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {evaluation.improvements.map((item, i) => (
                            <li key={`improvement-${i}`}>{item}</li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </section>
    );
}
