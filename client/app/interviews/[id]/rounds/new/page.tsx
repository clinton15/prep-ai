"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/protected-route";
import AppLayout from "@/components/layout/app-layout";
import InterviewRoundForm from "@/components/interview-round/interview-round-form";
import PageHeader from "@/components/shared/page-header";
import { useInterviewProcess } from "@/hooks/use-interview-process";
import { useCreateInterviewRound } from "@/hooks/use-interview-round";
import {
    toCreateRoundPayload,
    type CreateInterviewRoundFormValues,
} from "@/lib/validations/interview-round";
import type { ApiError } from "@/types/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewInterviewRoundPage() {
    const params = useParams<{ id: string }>();
    const processId = params.id;
    const router = useRouter();

    const {
        data: processData,
        isLoading,
        isError,
        error,
    } = useInterviewProcess(processId);

    const createMutation = useCreateInterviewRound();
    const process = processData?.interviewProcess;

    function handleSubmit(values: CreateInterviewRoundFormValues) {
        createMutation.mutate(toCreateRoundPayload(processId, values), {
            onSuccess: (data) => {
                toast.success(data.message ?? "Interview round created");
                router.replace(`/interviews/${processId}`);
            },
            onError: (err: ApiError) => {
                toast.error(
                    err.response?.data?.message ??
                        "Failed to create interview round"
                );
            },
        });
    }

    return (
        <ProtectedRoute>
            <AppLayout title="New Round">
                {isLoading ? (
                    <div className="space-y-4" aria-busy="true">
                        <Skeleton className="h-8 w-56" />
                        <Skeleton className="h-4 w-72" />
                        <Skeleton className="mt-4 h-64 w-full max-w-xl rounded-xl" />
                    </div>
                ) : isError || !process || process.isArchived ? (
                    <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            {process?.isArchived
                                ? "This process is archived. New rounds cannot be added."
                                : (error?.response?.data?.message ??
                                  "Interview process not found.")}
                        </p>
                        <Button
                            asChild
                            className="mt-4"
                            variant="outline"
                            size="sm"
                        >
                            <Link href={`/interviews/${processId}`}>
                                Back to process
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <PageHeader
                            title="Add interview round"
                            description={`${process.role} at ${process.company}`}
                            actions={
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/interviews/${processId}`}>
                                        Back
                                    </Link>
                                </Button>
                            }
                        />

                        <Card className="mx-auto w-full max-w-xl">
                            <CardContent className="pt-2">
                                <InterviewRoundForm
                                    mode="create"
                                    onSubmit={handleSubmit}
                                    isSubmitting={createMutation.isPending}
                                />
                            </CardContent>
                        </Card>
                    </>
                )}
            </AppLayout>
        </ProtectedRoute>
    );
}
