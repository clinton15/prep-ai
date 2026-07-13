"use client";

import type { InterviewProcess } from "@/types/interview-process";
import { ArchiveInterviewProcessButton } from "@/components/interview-process/archive-interview-process-dialog";
import EmptyState from "@/components/shared/empty-state";
import StatusBadge from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface InterviewProcessListProps {
    processes: InterviewProcess[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    page: number;
    totalPages: number;
    total: number;
}

function formatDate(value: string) {
    try {
        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(new Date(value));
    } catch {
        return value;
    }
}

/**
 * Responsive interview process list — table on desktop, stacked cards on mobile.
 */
export default function InterviewProcessList({
    processes,
    isLoading,
    isError,
    errorMessage,
    page,
    totalPages,
    total,
}: InterviewProcessListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function goToPage(nextPage: number) {
        const params = new URLSearchParams(searchParams.toString());

        if (nextPage <= 1) {
            params.delete("page");
        } else {
            params.set("page", String(nextPage));
        }

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
    }

    if (isLoading) {
        return (
            <div
                className="overflow-hidden rounded-xl border"
                aria-busy="true"
                aria-label="Loading"
            >
                <div className="border-b bg-muted/30 px-4 py-3">
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="divide-y">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between gap-4 px-4 py-3.5"
                        >
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
                {errorMessage ?? "Failed to load interview processes."}
            </p>
        );
    }

    if (processes.length === 0) {
        return (
            <EmptyState
                icon={Briefcase}
                title="No interview processes yet"
                description="Create a process to start tracking a company and role."
                actionHref="/interviews/new"
                actionLabel="Create Interview"
            />
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                    {processes.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">{total}</span>{" "}
                process{total === 1 ? "" : "es"}
            </p>

            <ul className="space-y-2.5 md:hidden" aria-label="Interview processes">
                {processes.map((process) => (
                    <li
                        key={process._id}
                        className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium tracking-tight">
                                    {process.role}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {process.company}
                                </p>
                            </div>
                            <StatusBadge status={process.applicationStatus} />
                        </div>

                        <p className="mt-2.5 text-xs text-muted-foreground">
                            Applied {formatDate(process.appliedDate)}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/interviews/${process._id}`}>
                                    View
                                </Link>
                            </Button>
                            <ArchiveInterviewProcessButton
                                processId={process._id}
                                company={process.company}
                                role={process.role}
                            />
                        </div>
                    </li>
                ))}
            </ul>

            <div className="hidden overflow-hidden rounded-xl border md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="bg-muted/30 h-10 text-xs">
                                Company
                            </TableHead>
                            <TableHead className="bg-muted/30 h-10 text-xs">
                                Role
                            </TableHead>
                            <TableHead className="bg-muted/30 h-10 text-xs">
                                Status
                            </TableHead>
                            <TableHead className="bg-muted/30 h-10 text-xs">
                                Applied
                            </TableHead>
                            <TableHead className="bg-muted/30 h-10 text-right text-xs">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processes.map((process) => (
                            <TableRow
                                key={process._id}
                                className="group cursor-pointer"
                                onClick={() =>
                                    router.push(`/interviews/${process._id}`)
                                }
                            >
                                <TableCell className="font-medium">
                                    {process.company}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {process.role}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        status={process.applicationStatus}
                                    />
                                </TableCell>
                                <TableCell className="tabular-nums text-muted-foreground">
                                    {formatDate(process.appliedDate)}
                                </TableCell>
                                <TableCell
                                    className="text-right"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="inline-flex gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <Link
                                                href={`/interviews/${process._id}`}
                                            >
                                                View
                                            </Link>
                                        </Button>
                                        <ArchiveInterviewProcessButton
                                            processId={process._id}
                                            company={process.company}
                                            role={process.role}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 ? (
                <nav
                    className="flex items-center justify-between gap-4 pt-1"
                    aria-label="Pagination"
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => goToPage(page - 1)}
                    >
                        Previous
                    </Button>

                    <span className="text-xs tabular-nums text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => goToPage(page + 1)}
                    >
                        Next
                    </Button>
                </nav>
            ) : null}
        </div>
    );
}
