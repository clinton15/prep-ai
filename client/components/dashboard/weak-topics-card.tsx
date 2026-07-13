"use client";

import type { DashboardTopicStat } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface WeakTopicsCardProps {
    topics?: DashboardTopicStat[];
    isLoading: boolean;
}

/**
 * Lists topics with average score below the weak threshold.
 */
export default function WeakTopicsCard({
    topics,
    isLoading,
}: WeakTopicsCardProps) {
    const data = topics ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Weak topics</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2" aria-busy="true">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No weak topics yet. Practice more to surface areas to
                        revise.
                    </p>
                ) : (
                    <ul className="space-y-3" aria-label="Weak topics">
                        {data.map((item) => (
                            <li
                                key={item.topic}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">
                                        {item.topic}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                        Practice more {item.topic} questions
                                    </span>
                                </div>
                                <span className="font-medium tabular-nums">
                                    {item.averageScore}/10
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
