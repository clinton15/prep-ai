"use client";

import { useMemo } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    archiveInterviewRound,
    createInterviewRound,
    getInterviewRound,
    getInterviewRounds,
    updateInterviewRound,
} from "@/services/interview-round.service";

import type { ApiError } from "@/types/api-error";
import type {
    CreateInterviewRoundPayload,
    InterviewRound,
    InterviewRoundListResponse,
    InterviewRoundResponse,
    UpdateInterviewRoundPayload,
} from "@/types/interview-round";
import { getRoundProcessId } from "@/types/interview-round";

export const interviewRoundKeys = {
    all: ["interview-rounds"] as const,
    lists: () => [...interviewRoundKeys.all, "list"] as const,
    list: () => [...interviewRoundKeys.lists()] as const,
    details: () => [...interviewRoundKeys.all, "detail"] as const,
    detail: (id: string) => [...interviewRoundKeys.details(), id] as const,
};

export function useInterviewRounds() {
    return useQuery<InterviewRoundListResponse, ApiError>({
        queryKey: interviewRoundKeys.list(),
        queryFn: getInterviewRounds,
    });
}

/**
 * Rounds for one process, sorted oldest-first (creation order ≈ interview sequence).
 * Backend list has no process filter — we filter client-side.
 */
export function useInterviewRoundsByProcess(processId: string) {
    const query = useInterviewRounds();

    const rounds = useMemo(() => {
        const all = query.data?.interviewRounds ?? [];

        return all
            .filter((round) => getRoundProcessId(round) === processId)
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            );
    }, [query.data?.interviewRounds, processId]);

    return {
        ...query,
        rounds,
    };
}

export function useInterviewRound(id: string) {
    return useQuery<InterviewRoundResponse, ApiError>({
        queryKey: interviewRoundKeys.detail(id),
        queryFn: () => getInterviewRound(id),
        enabled: Boolean(id),
        retry: false,
    });
}

export function useCreateInterviewRound() {
    const queryClient = useQueryClient();

    return useMutation<
        InterviewRoundResponse,
        ApiError,
        CreateInterviewRoundPayload
    >({
        mutationFn: createInterviewRound,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: interviewRoundKeys.lists(),
            });
        },
    });
}

export function useUpdateInterviewRound(id: string) {
    const queryClient = useQueryClient();

    return useMutation<
        InterviewRoundResponse,
        ApiError,
        UpdateInterviewRoundPayload
    >({
        mutationFn: (data) => updateInterviewRound(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: interviewRoundKeys.lists(),
            });
            queryClient.setQueryData(
                interviewRoundKeys.detail(id),
                data
            );
        },
    });
}

export function useArchiveInterviewRound() {
    const queryClient = useQueryClient();

    return useMutation<{ message: string }, ApiError, string>({
        mutationFn: archiveInterviewRound,
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: interviewRoundKeys.lists(),
            });
            queryClient.removeQueries({
                queryKey: interviewRoundKeys.detail(id),
            });
        },
    });
}

export type { InterviewRound };
