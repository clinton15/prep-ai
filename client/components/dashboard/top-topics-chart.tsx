"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type { DashboardTopicStat } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TopTopicsChartProps {
    topics?: DashboardTopicStat[];
    isLoading: boolean;
}

/**
 * Bar chart of most practiced topics by answer count.
 */
export default function TopTopicsChart({
    topics,
    isLoading,
}: TopTopicsChartProps) {
    const data = topics ?? [];
    const hasData = data.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Most practiced topics</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                ) : !hasData ? (
                    <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                        Practice some questions to see topic breakdown.
                    </p>
                ) : (
                    <div
                        className="h-64 w-full"
                        role="img"
                        aria-label="Most practiced topics chart"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-border"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="topic"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                    height={56}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tickLine={false}
                                    axisLine={false}
                                    width={28}
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                />
                                <Tooltip
                                    cursor={{ fill: "var(--muted)" }}
                                    contentStyle={{
                                        background: "var(--background)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                    }}
                                    formatter={(value, name) => {
                                        if (name === "count") {
                                            return [value, "Answers"];
                                        }
                                        return [value, name];
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Answers"
                                    fill="var(--foreground)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
