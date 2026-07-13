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

import type { DashboardApplicationsSummary } from "@/types/dashboard";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicationStatusChartProps {
    applications?: DashboardApplicationsSummary;
    isLoading: boolean;
}

function buildChartData(applications?: DashboardApplicationsSummary) {
    if (!applications) {
        return [];
    }

    return [
        { status: "Applied", count: applications.applied },
        { status: "Screening", count: applications.screening },
        { status: "Interviewing", count: applications.interviewing },
        { status: "Offer", count: applications.offers },
        { status: "Rejected", count: applications.rejected },
        { status: "Withdrawn", count: applications.withdrawn },
    ];
}

/**
 * Bar chart of application counts by status.
 */
export default function ApplicationStatusChart({
    applications,
    isLoading,
}: ApplicationStatusChartProps) {
    const data = buildChartData(applications);
    const hasData = data.some((item) => item.count > 0);

    return (
        <Card className="transition-shadow duration-200 hover:shadow-sm">
            <CardHeader className="border-b [.border-b]:pb-4">
                <CardTitle className="text-sm font-medium">
                    Applications by status
                </CardTitle>
                <CardDescription>
                    Pipeline distribution across active processes
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {isLoading ? (
                    <div className="space-y-3" aria-busy="true">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <div className="flex gap-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-14" />
                        </div>
                    </div>
                ) : !hasData ? (
                    <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                        No applications yet. Create an interview process to see
                        the breakdown.
                    </p>
                ) : (
                    <div
                        className="h-64 w-full"
                        role="img"
                        aria-label="Applications by status chart"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{
                                    top: 8,
                                    right: 8,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-border"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="status"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    interval={0}
                                    angle={-20}
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
                                        background: "var(--card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.8125rem",
                                        boxShadow:
                                            "0 4px 12px color-mix(in oklch, var(--foreground) 8%, transparent)",
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Applications"
                                    fill="var(--chart-1)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
