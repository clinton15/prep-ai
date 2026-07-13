"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import ProtectedRoute from "@/components/auth/protected-route";
import AppLayout from "@/components/layout/app-layout";
import InterviewProcessFilters from "@/components/interview-process/interview-process-filters";
import InterviewProcessList from "@/components/interview-process/interview-process-list";
import PageHeader from "@/components/shared/page-header";
import { useInterviewProcesses } from "@/hooks/use-interview-process";
import {
    APPLICATION_STATUSES,
    type ApplicationStatus,
    type InterviewProcessListParams,
} from "@/types/interview-process";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function parseStatus(value: string | null): ApplicationStatus | "" {
    if (!value) {
        return "";
    }

    return APPLICATION_STATUSES.includes(value as ApplicationStatus)
        ? (value as ApplicationStatus)
        : "";
}

function InterviewsContent() {
    const searchParams = useSearchParams();

    const filters = {
        company: searchParams.get("company") ?? "",
        role: searchParams.get("role") ?? "",
        status: parseStatus(searchParams.get("status")),
    };

    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

    const queryParams: InterviewProcessListParams = {
        page,
        limit: 10,
        ...(filters.company ? { company: filters.company } : {}),
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.status ? { status: filters.status } : {}),
    };

    const { data, isLoading, isError, error } =
        useInterviewProcesses(queryParams);

    return (
        <>
            <PageHeader
                title="Interview Processes"
                description="Track applications and prepare for each role."
                actions={
                    <Button asChild size="sm">
                        <Link href="/interviews/new">
                            <Plus className="size-3.5" />
                            Create Interview
                        </Link>
                    </Button>
                }
            />

            <div className="mb-6">
                <InterviewProcessFilters values={filters} />
            </div>

            <InterviewProcessList
                processes={data?.interviewProcesses ?? []}
                isLoading={isLoading}
                isError={isError}
                errorMessage={error?.response?.data?.message}
                page={data?.page ?? page}
                totalPages={data?.totalPages ?? 1}
                total={data?.total ?? 0}
            />
        </>
    );
}

export default function InterviewsPage() {
    return (
        <ProtectedRoute>
            <AppLayout title="Interviews">
                <Suspense
                    fallback={
                        <div className="space-y-4" aria-busy="true">
                            <Skeleton className="h-8 w-56" />
                            <Skeleton className="h-4 w-72" />
                            <Skeleton className="mt-6 h-28 w-full rounded-xl" />
                            <Skeleton className="h-64 w-full rounded-xl" />
                        </div>
                    }
                >
                    <InterviewsContent />
                </Suspense>
            </AppLayout>
        </ProtectedRoute>
    );
}
