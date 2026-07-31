"use client";

import { useMemo } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { DashboardTopicProgressSeries } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

interface TopicProgressChartProps {
    series?: DashboardTopicProgressSeries[];
    isLoading: boolean;
}

/**
 * Multi-line chart of average score over time (weekly) per topic.
 */
export default function TopicProgressChart({
    series,
    isLoading,
}: TopicProgressChartProps) {
    const topics = series ?? [];

    const { chartData, topicNames } = useMemo(() => {
        const names = topics.map((s) => s.topic);
        const dateSet = new Set<string>();

        for (const s of topics) {
            for (const p of s.points) {
                dateSet.add(p.date);
            }
        }

        const dates = [...dateSet].sort((a, b) => a.localeCompare(b));

        const rows = dates.map((date) => {
            const row: Record<string, string | number | null> = { date };
            for (const s of topics) {
                const point = s.points.find((p) => p.date === date);
                row[s.topic] = point ? point.averageScore : null;
            }
            return row;
        });

        return { chartData: rows, topicNames: names };
    }, [topics]);

    const hasData = topicNames.length > 0 && chartData.length > 0;

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Score progress by topic</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-72 w-full" />
                ) : !hasData ? (
                    <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                        Practice across multiple sessions to see score trends
                        per topic.
                    </p>
                ) : (
                    <div
                        className="h-72 w-full"
                        role="img"
                        aria-label="Score progress by topic over time"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-border"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    tickLine={false}
                                    axisLine={false}
                                    width={28}
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--background)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                    }}
                                    formatter={(value, name) => {
                                        if (value == null) {
                                            return ["—", name];
                                        }
                                        return [value, name];
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{
                                        fontSize: "0.75rem",
                                        paddingTop: 8,
                                    }}
                                />
                                {topicNames.map((topic, index) => (
                                    <Line
                                        key={topic}
                                        type="monotone"
                                        dataKey={topic}
                                        name={topic}
                                        stroke={
                                            CHART_COLORS[
                                                index % CHART_COLORS.length
                                            ]
                                        }
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
