"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/protected-route";
import AppLayout from "@/components/layout/app-layout";
import InterviewProcessForm from "@/components/interview-process/interview-process-form";
import { ArchiveInterviewProcessButton } from "@/components/interview-process/archive-interview-process-dialog";
import InterviewRoundList from "@/components/interview-round/interview-round-list";
import StatusBadge from "@/components/shared/status-badge";
import {
    useInterviewProcess,
    useUpdateInterviewProcess,
} from "@/hooks/use-interview-process";
import { useInterviewRoundsByProcess } from "@/hooks/use-interview-round";
import {
    toUpdatePayload,
    type UpdateInterviewProcessFormValues,
} from "@/lib/validations/interview-process";
import type { ApiError } from "@/types/api-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function InterviewProcessDetailContent({ id }: { id: string }) {
    const router = useRouter();
    const { data, isLoading, isError, error } = useInterviewProcess(id);
    const updateMutation = useUpdateInterviewProcess(id);
    const {
        rounds,
        isLoading: roundsLoading,
        isError: roundsError,
        error: roundsErrorData,
    } = useInterviewRoundsByProcess(id);

    const process = data?.interviewProcess;

    function handleSubmit(values: UpdateInterviewProcessFormValues) {
        updateMutation.mutate(toUpdatePayload(values), {
            onSuccess: (response) => {
                toast.success(
                    response.message ?? "Interview process updated"
                );
            },
            onError: (err: ApiError) => {
                toast.error(
                    err.response?.data?.message ??
                        "Failed to update interview process"
                );
            },
        });
    }

    if (isLoading) {
        return (
            <div className="space-y-6" aria-busy="true">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-64 w-full max-w-xl rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        );
    }

    if (isError || !process) {
        return (
            <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                    {error?.response?.data?.message ??
                        "Interview process not found."}
                </p>
                <Button asChild className="mt-4" variant="outline" size="sm">
                    <Link href="/interviews">Back to list</Link>
                </Button>
            </div>
        );
    }

    const isArchived = process.isArchived;

    return (
        <>
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                            {process.role}
                        </h1>
                        <StatusBadge status={process.applicationStatus} />
                        {isArchived ? (
                            <Badge variant="outline">Archived</Badge>
                        ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {process.company}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/interviews">Back</Link>
                    </Button>

                    {!isArchived ? (
                        <ArchiveInterviewProcessButton
                            processId={process._id}
                            company={process.company}
                            role={process.role}
                            onArchived={() => router.replace("/interviews")}
                        />
                    ) : null}
                </div>
            </header>

            {isArchived ? (
                <p className="mb-8 rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    This process is archived and cannot be edited.
                </p>
            ) : (
                <Card className="mb-8 max-w-xl">
                    <CardHeader className="border-b [.border-b]:pb-4">
                        <CardTitle className="text-sm font-medium">
                            Process details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <InterviewProcessForm
                            mode="edit"
                            process={process}
                            onSubmit={handleSubmit}
                            isSubmitting={updateMutation.isPending}
                        />
                    </CardContent>
                </Card>
            )}

            <section aria-labelledby="process-rounds">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2
                            id="process-rounds"
                            className="text-base font-semibold tracking-tight"
                        >
                            Interview rounds
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Shown in the order they were created.
                        </p>
                    </div>

                    {!isArchived ? (
                        <Button asChild size="sm">
                            <Link href={`/interviews/${id}/rounds/new`}>
                                Add round
                            </Link>
                        </Button>
                    ) : null}
                </div>

                <InterviewRoundList
                    processId={id}
                    rounds={rounds}
                    isLoading={roundsLoading}
                    isError={roundsError}
                    errorMessage={roundsErrorData?.response?.data?.message}
                    readOnly={isArchived}
                />
            </section>
        </>
    );
}

export default function InterviewProcessDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    return (
        <ProtectedRoute>
            <AppLayout title="Interview">
                <InterviewProcessDetailContent id={id} />
            </AppLayout>
        </ProtectedRoute>
    );
}
