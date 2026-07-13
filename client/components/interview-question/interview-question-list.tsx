"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

import type { InterviewQuestion } from "@/types/interview-question";
import { useUpdateQuestion } from "@/hooks/use-interview-question";
import type { ApiError } from "@/types/api-error";
import EmptyState from "@/components/shared/empty-state";
import LoadingButton from "@/components/shared/loading-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface InterviewQuestionListProps {
    roundId: string;
    questions: InterviewQuestion[];
    allQuestionsCount?: number;
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    readOnly?: boolean;
}

function difficultyVariant(
    difficulty: InterviewQuestion["difficulty"]
): "secondary" | "outline" | "destructive" {
    if (difficulty === "Easy") return "secondary";
    if (difficulty === "Hard") return "destructive";
    return "outline";
}

function statusVariant(
    status: InterviewQuestion["status"]
): "secondary" | "outline" | "default" {
    if (status === "Completed") return "default";
    if (status === "Practiced") return "secondary";
    return "outline";
}

export default function InterviewQuestionList({
    roundId,
    questions,
    allQuestionsCount,
    isLoading,
    isError,
    errorMessage,
    readOnly = false,
}: InterviewQuestionListProps) {
    const updateMutation = useUpdateQuestion(roundId);
    const [pendingUnbookmark, setPendingUnbookmark] =
        useState<InterviewQuestion | null>(null);

    function addBookmark(question: InterviewQuestion) {
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

    function confirmRemoveBookmark() {
        if (!pendingUnbookmark) return;
        const question = pendingUnbookmark;
        updateMutation.mutate(
            {
                questionId: question._id,
                data: { isBookmarked: false },
            },
            {
                onSuccess: () => {
                    toast.success("Bookmark removed");
                    setPendingUnbookmark(null);
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

    if (isLoading) {
        return (
            <div
                className="space-y-2.5"
                aria-busy="true"
                aria-label="Loading questions"
            >
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
                {errorMessage ?? "Failed to load questions."}
            </p>
        );
    }

    if (questions.length === 0) {
        const filteredEmpty =
            typeof allQuestionsCount === "number" && allQuestionsCount > 0;

        return (
            <EmptyState
                title={
                    filteredEmpty
                        ? "No matching questions"
                        : "No questions yet"
                }
                description={
                    filteredEmpty
                        ? "Try clearing filters or adjusting your search."
                        : "Generate questions to start practicing."
                }
            />
        );
    }

    return (
        <>
            <ol className="space-y-2.5" aria-label="Interview questions">
                {questions.map((item) => (
                    <li
                        key={item._id}
                        className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20"
                    >
                        <div className="mb-2.5 flex flex-wrap items-center gap-2">
                            <span className="inline-flex size-5 items-center justify-center rounded-md bg-muted text-[10px] font-medium tabular-nums text-muted-foreground">
                                {item.order}
                            </span>
                            <Badge variant="secondary">{item.topic}</Badge>
                            <Badge
                                variant={difficultyVariant(item.difficulty)}
                            >
                                {item.difficulty}
                            </Badge>
                            <Badge variant={statusVariant(item.status)}>
                                {item.status}
                            </Badge>
                            {item.isFollowUp ? (
                                <Badge variant="outline">Follow-up</Badge>
                            ) : null}

                            <div className="ml-auto">
                                {!readOnly ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={
                                            item.isBookmarked
                                                ? "Remove bookmark"
                                                : "Bookmark question"
                                        }
                                        aria-pressed={item.isBookmarked}
                                        disabled={updateMutation.isPending}
                                        onClick={() => {
                                            if (item.isBookmarked) {
                                                setPendingUnbookmark(item);
                                            } else {
                                                addBookmark(item);
                                            }
                                        }}
                                    >
                                        {item.isBookmarked ? (
                                            <BookmarkCheck className="size-4" />
                                        ) : (
                                            <Bookmark className="size-4" />
                                        )}
                                    </Button>
                                ) : item.isBookmarked ? (
                                    <BookmarkCheck
                                        className="size-4 text-muted-foreground"
                                        aria-label="Bookmarked"
                                    />
                                ) : null}
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed">
                            {item.question}
                        </p>

                        {item.notes ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Note: {item.notes}
                            </p>
                        ) : null}
                    </li>
                ))}
            </ol>

            <Dialog
                open={Boolean(pendingUnbookmark)}
                onOpenChange={(open) => {
                    if (!open) setPendingUnbookmark(null);
                }}
            >
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
                            onClick={() => setPendingUnbookmark(null)}
                        >
                            Cancel
                        </Button>
                        <LoadingButton
                            type="button"
                            loading={updateMutation.isPending}
                            onClick={confirmRemoveBookmark}
                        >
                            Remove bookmark
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
