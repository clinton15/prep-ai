"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import ProtectedRoute from "@/components/auth/protected-route";
import AppLayout from "@/components/layout/app-layout";
import DashboardStatCards from "@/components/dashboard/dashboard-stat-cards";
import ApplicationStatusChart from "@/components/dashboard/application-status-chart";
import RoundsOverviewChart from "@/components/dashboard/rounds-overview-chart";
import TopTopicsChart from "@/components/dashboard/top-topics-chart";
import WeakTopicsCard from "@/components/dashboard/weak-topics-card";
import TopicProgressChart from "@/components/dashboard/topic-progress-chart";
import RecentActivityList from "@/components/dashboard/recent-activity-list";
import PageHeader from "@/components/shared/page-header";
import QueryError from "@/components/shared/query-error";
import { useCurrentUser } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const { data: user } = useCurrentUser();
    const {
        data: dashboard,
        isLoading,
        isError,
        error,
        refetch,
    } = useDashboard();

    const summary = dashboard?.summary;
    const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there";

    return (
        <ProtectedRoute>
            <AppLayout title="Dashboard">
                <PageHeader
                    title={`Welcome back, ${firstName}`}
                    description="Track applications, rounds, and practice progress."
                    actions={
                        <>
                            <Button asChild size="sm">
                                <Link href="/interviews/new">
                                    <Plus className="size-3.5" />
                                    Create Interview
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/interviews">View Interviews</Link>
                            </Button>
                        </>
                    }
                />

                {isError ? (
                    <div className="mb-8">
                        <QueryError
                            error={error}
                            message="Failed to load dashboard."
                            onRetry={() => refetch()}
                        />
                    </div>
                ) : null}

                <div className="mb-8">
                    <DashboardStatCards
                        summary={summary}
                        experience={user?.experience ?? 0}
                        isLoading={isLoading}
                    />
                </div>

                <section
                    className="mb-8 grid gap-4 lg:grid-cols-2"
                    aria-label="Charts"
                >
                    <ApplicationStatusChart
                        applications={summary?.applications}
                        isLoading={isLoading}
                    />
                    <RoundsOverviewChart
                        rounds={summary?.rounds}
                        averageScore={summary?.performance.averageScore}
                        isLoading={isLoading}
                    />
                    <TopTopicsChart
                        topics={summary?.topTopics}
                        isLoading={isLoading}
                    />
                    <WeakTopicsCard
                        topics={summary?.weakTopics}
                        isLoading={isLoading}
                    />
                    <TopicProgressChart
                        series={summary?.topicProgress}
                        isLoading={isLoading}
                    />
                </section>

                <RecentActivityList
                    activity={dashboard?.recentActivity}
                    isLoading={isLoading}
                />
            </AppLayout>
        </ProtectedRoute>
    );
}
