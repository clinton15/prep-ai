"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { DashboardRecentActivityItem } from "@/types/dashboard";
import StatusBadge from "@/components/shared/status-badge";
import EmptyState from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivityListProps {
    activity?: DashboardRecentActivityItem[];
    isLoading: boolean;
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
 * Last updated interview processes from the dashboard API.
 */
export default function RecentActivityList({
    activity = [],
    isLoading,
}: RecentActivityListProps) {
    return (
        <Card className="transition-shadow duration-200 hover:shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b [.border-b]:pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                        Recent activity
                    </CardTitle>
                    <CardDescription>
                        Latest updates across your interview processes
                    </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="shrink-0">
                    <Link href="/interviews">
                        View all
                        <ArrowUpRight className="size-3.5 opacity-60" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-2">
                {isLoading ? (
                    <div className="space-y-1" aria-busy="true">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between gap-4 py-3"
                            >
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : activity.length === 0 ? (
                    <EmptyState
                        title="No recent activity"
                        description="Create an interview process to start tracking progress."
                        actionHref="/interviews/new"
                        actionLabel="Create Interview"
                        className="border-0 bg-transparent py-10"
                    />
                ) : (
                    <ul
                        className="divide-y divide-border/80"
                        aria-label="Recent interview processes"
                    >
                        {activity.map((item) => (
                            <li key={item._id}>
                                <Link
                                    href={`/interviews/${item._id}`}
                                    className="group flex flex-col gap-2 rounded-md py-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:-mx-2 sm:px-2"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium tracking-tight group-hover:text-foreground">
                                            {item.role}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {item.company}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <StatusBadge
                                            status={item.applicationStatus}
                                        />
                                        <time
                                            dateTime={item.updatedAt}
                                            className="text-xs tabular-nums text-muted-foreground"
                                        >
                                            {formatDate(item.updatedAt)}
                                        </time>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
