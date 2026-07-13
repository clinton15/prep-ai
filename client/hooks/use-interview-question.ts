"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    generateFollowUps,
    generateQuestions,
    getQuestionsByRound,
    updateQuestion,
} from "@/services/interview-question.service";

import type { ApiError } from "@/types/api-error";
import type {
    GenerateQuestionsPayload,
    InterviewQuestionResponse,
    InterviewQuestionsResponse,
    QuestionFilters,
    UpdateQuestionPayload,
} from "@/types/interview-question";

export const interviewQuestionKeys = {
    all: ["interview-questions"] as const,
    lists: () => [...interviewQuestionKeys.all, "list"] as const,
    byRound: (roundId: string, filters?: QuestionFilters) =>
        [...interviewQuestionKeys.lists(), roundId, filters ?? {}] as const,
};

export function useQuestionsByRound(
    roundId: string,
    filters?: QuestionFilters
) {
    return useQuery<InterviewQuestionsResponse, ApiError>({
        queryKey: interviewQuestionKeys.byRound(roundId, filters),
        queryFn: () => getQuestionsByRound(roundId, filters),
        enabled: Boolean(roundId),
        retry: false,
    });
}

export function useGenerateQuestions(roundId: string) {
    const queryClient = useQueryClient();

    return useMutation<
        InterviewQuestionsResponse,
        ApiError,
        GenerateQuestionsPayload
    >({
        mutationFn: generateQuestions,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...interviewQuestionKeys.lists(), roundId],
            });
        },
    });
}

export function useUpdateQuestion(roundId: string) {
    const queryClient = useQueryClient();

    return useMutation<
        InterviewQuestionResponse,
        ApiError,
        { questionId: string; data: UpdateQuestionPayload }
    >({
        mutationFn: ({ questionId, data }) =>
            updateQuestion(questionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...interviewQuestionKeys.lists(), roundId],
            });
        },
    });
}

export function useGenerateFollowUps(roundId: string) {
    const queryClient = useQueryClient();

    return useMutation<InterviewQuestionsResponse, ApiError, string>({
        mutationFn: generateFollowUps,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...interviewQuestionKeys.lists(), roundId],
            });
        },
    });
}
