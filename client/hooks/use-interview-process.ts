"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    archiveInterviewProcess,
    createInterviewProcess,
    getInterviewProcess,
    getInterviewProcesses,
    updateInterviewProcess,
} from "@/services/interview-process.service";

import type { ApiError } from "@/types/api-error";
import type {
    CreateInterviewProcessPayload,
    InterviewProcessListParams,
    InterviewProcessListResponse,
    InterviewProcessResponse,
    UpdateInterviewProcessPayload,
} from "@/types/interview-process";

export const interviewProcessKeys = {
    all: ["interview-processes"] as const,
    lists: () => [...interviewProcessKeys.all, "list"] as const,
    list: (params: InterviewProcessListParams) =>
        [...interviewProcessKeys.lists(), params] as const,
    details: () => [...interviewProcessKeys.all, "detail"] as const,
    detail: (id: string) => [...interviewProcessKeys.details(), id] as const,
};

export function useInterviewProcesses(
    params: InterviewProcessListParams = {}
) {
    return useQuery<InterviewProcessListResponse, ApiError>({
        queryKey: interviewProcessKeys.list(params),
        queryFn: () => getInterviewProcesses(params),
    });
}

export function useInterviewProcess(id: string) {
    return useQuery<InterviewProcessResponse, ApiError>({
        queryKey: interviewProcessKeys.detail(id),
        queryFn: () => getInterviewProcess(id),
        enabled: Boolean(id),
        retry: false,
    });
}

export function useCreateInterviewProcess() {
    const queryClient = useQueryClient();

    return useMutation<
        InterviewProcessResponse,
        ApiError,
        CreateInterviewProcessPayload
    >({
        mutationFn: createInterviewProcess,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: interviewProcessKeys.lists(),
            });
        },
    });
}

export function useUpdateInterviewProcess(id: string) {
    const queryClient = useQueryClient();

    return useMutation<
        InterviewProcessResponse,
        ApiError,
        UpdateInterviewProcessPayload
    >({
        mutationFn: (data) => updateInterviewProcess(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: interviewProcessKeys.lists(),
            });
            queryClient.setQueryData(
                interviewProcessKeys.detail(id),
                data
            );
        },
    });
}

export function useArchiveInterviewProcess() {
    const queryClient = useQueryClient();

    return useMutation<
        { message: string },
        ApiError,
        string
    >({
        mutationFn: archiveInterviewProcess,
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: interviewProcessKeys.lists(),
            });
            queryClient.removeQueries({
                queryKey: interviewProcessKeys.detail(id),
            });
        },
    });
}
