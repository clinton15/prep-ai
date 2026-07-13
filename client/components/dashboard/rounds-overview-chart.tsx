"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { DashboardRoundsSummary } from "@/types/dashboard";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RoundsOverviewChartProps {
    rounds?: DashboardRoundsSummary;
    averageScore?: number;
    isLoading: boolean;
}

/**
 * Rounds completion overview + average practice score.
 */
export default function RoundsOverviewChart({
    rounds,
    averageScore = 0,
    isLoading,
}: RoundsOverviewChartProps) {
    const completed = rounds?.completed ?? 0;
    const upcoming = rounds?.pending ?? 0;
    const cancelled = Math.max(
        0,
        (rounds?.total ?? 0) - completed - upcoming
    );

    const data = [
        { name: "Completed", value: completed, color: "var(--chart-2)" },
        { name: "Upcoming", value: upcoming, color: "var(--chart-1)" },
        { name: "Other", value: cancelled, color: "var(--chart-5)" },
    ].filter((item) => item.value > 0);

    const hasData = data.length > 0;

    return (
        <Card className="transition-shadow duration-200 hover:shadow-sm">
            <CardHeader className="border-b [.border-b]:pb-4">
                <CardTitle className="text-sm font-medium">
                    Rounds & performance
                </CardTitle>
                <CardDescription>
                    Completion mix and practice score
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {isLoading ? (
                    <div
                        className="grid gap-6 sm:grid-cols-2 sm:items-center"
                        aria-busy="true"
                    >
                        <Skeleton className="mx-auto size-40 rounded-full" />
                        <div className="space-y-3">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-3 w-36" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
                        <div
                            className="h-48 w-full"
                            role="img"
                            aria-label="Rounds status chart"
                        >
                            {!hasData ? (
                                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    No rounds yet.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={52}
                                            outerRadius={74}
                                            paddingAngle={3}
                                            strokeWidth={0}
                                        >
                                            {data.map((entry) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: "var(--card)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "0.5rem",
                                                fontSize: "0.8125rem",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Average answer score
                                </p>
                                <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                                    {averageScore.toFixed(1)}
                                    <span className="ml-0.5 text-sm font-normal text-muted-foreground">
                                        /10
                                    </span>
                                </p>
                            </div>

                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center justify-between gap-3">
                                    <span className="text-muted-foreground">
                                        Total rounds
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {rounds?.total ?? 0}
                                    </span>
                                </li>
                                <li className="flex items-center justify-between gap-3">
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <span
                                            className="size-2 rounded-full"
                                            style={{
                                                background: "var(--chart-2)",
                                            }}
                                        />
                                        Completed
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {completed}
                                    </span>
                                </li>
                                <li className="flex items-center justify-between gap-3">
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <span
                                            className="size-2 rounded-full"
                                            style={{
                                                background: "var(--chart-1)",
                                            }}
                                        />
                                        Upcoming
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {upcoming}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
