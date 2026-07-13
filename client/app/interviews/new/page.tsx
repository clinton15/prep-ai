"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/protected-route";
import AppLayout from "@/components/layout/app-layout";
import InterviewProcessForm from "@/components/interview-process/interview-process-form";
import PageHeader from "@/components/shared/page-header";
import { useCreateInterviewProcess } from "@/hooks/use-interview-process";
import {
    toCreatePayload,
    type CreateInterviewProcessFormValues,
} from "@/lib/validations/interview-process";
import type { ApiError } from "@/types/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewInterviewProcessPage() {
    const router = useRouter();
    const createMutation = useCreateInterviewProcess();

    function handleSubmit(values: CreateInterviewProcessFormValues) {
        createMutation.mutate(toCreatePayload(values), {
            onSuccess: (data) => {
                toast.success(data.message ?? "Interview process created");
                router.replace(`/interviews/${data.interviewProcess._id}`);
            },
            onError: (error: ApiError) => {
                toast.error(
                    error.response?.data?.message ??
                        "Failed to create interview process"
                );
            },
        });
    }

    return (
        <ProtectedRoute>
            <AppLayout title="New Interview">
                <PageHeader
                    title="Create Interview Process"
                    description="Add a company and role to start tracking."
                    actions={
                        <Button asChild variant="outline" size="sm">
                            <Link href="/interviews">Back</Link>
                        </Button>
                    }
                />

                <Card className="mx-auto w-full max-w-xl">
                    <CardContent className="pt-2">
                        <InterviewProcessForm
                            mode="create"
                            onSubmit={handleSubmit}
                            isSubmitting={createMutation.isPending}
                        />
                    </CardContent>
                </Card>
            </AppLayout>
        </ProtectedRoute>
    );
}
