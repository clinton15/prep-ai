"use client";

import type { InterviewRound } from "@/types/interview-round";
import { ArchiveInterviewRoundButton } from "@/components/interview-round/archive-interview-round-dialog";
import EmptyState from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers } from "lucide-react";
import Link from "next/link";

interface InterviewRoundListProps {
    processId: string;
    rounds: InterviewRound[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    /** Hide add/edit/archive when the parent process is archived. */
    readOnly?: boolean;
}

function formatDateTime(value?: string) {
    if (!value) {
        return "Not scheduled";
    }

    try {
        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(new Date(value));
    } catch {
        return value;
    }
}

/**
 * Rounds for a process, shown in creation order (oldest first).
 */
export default function InterviewRoundList({
    processId,
    rounds,
    isLoading,
    isError,
    errorMessage,
    readOnly = false,
}: InterviewRoundListProps) {
    if (isLoading) {
        return (
            <div
                className="space-y-2.5"
                aria-busy="true"
                aria-label="Loading rounds"
            >
                <Skeleton className="h-[4.5rem] w-full rounded-xl" />
                <Skeleton className="h-[4.5rem] w-full rounded-xl" />
            </div>
        );
    }

    if (isError) {
        return (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
                {errorMessage ?? "Failed to load interview rounds."}
            </p>
        );
    }

    if (rounds.length === 0) {
        return (
            <EmptyState
                icon={Layers}
                title="No rounds yet"
                description="Add a round to start preparing for this interview."
                actionHref={
                    readOnly
                        ? undefined
                        : `/interviews/${processId}/rounds/new`
                }
                actionLabel={readOnly ? undefined : "Add round"}
            />
        );
    }

    return (
        <ol className="space-y-2.5" aria-label="Interview rounds">
            {rounds.map((round, index) => (
                <li
                    key={round._id}
                    className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex size-5 items-center justify-center rounded-md bg-muted text-[10px] font-medium tabular-nums text-muted-foreground">
                                    {index + 1}
                                </span>
                                <h3 className="truncate text-sm font-medium tracking-tight">
                                    {round.title}
                                </h3>
                            </div>

                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                                <Badge variant="secondary">
                                    {round.roundType}
                                </Badge>
                                <Badge variant="outline">{round.status}</Badge>
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                                {formatDateTime(round.scheduledAt)}
                            </p>
                        </div>

                        {!readOnly ? (
                            <div className="flex flex-wrap gap-2">
                                <Button asChild size="sm" variant="outline">
                                    <Link
                                        href={`/interviews/${processId}/rounds/${round._id}`}
                                    >
                                        Open
                                    </Link>
                                </Button>
                                <ArchiveInterviewRoundButton
                                    roundId={round._id}
                                    title={round.title}
                                />
                            </div>
                        ) : null}
                    </div>
                </li>
            ))}
        </ol>
    );
}
