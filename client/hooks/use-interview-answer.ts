"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    evaluateAnswer,
    getAnswerByQuestion,
} from "@/services/interview-answer.service";
import { interviewQuestionKeys } from "@/hooks/use-interview-question";

import type { ApiError } from "@/types/api-error";
import type {
    EvaluateAnswerPayload,
    EvaluateAnswerResponse,
    GetAnswerResponse,
} from "@/types/interview-answer";

export const interviewAnswerKeys = {
    all: ["interview-answers"] as const,
    byQuestion: (questionId: string) =>
        [...interviewAnswerKeys.all, "question", questionId] as const,
};

export function useAnswerByQuestion(questionId: string) {
    return useQuery<GetAnswerResponse, ApiError>({
        queryKey: interviewAnswerKeys.byQuestion(questionId),
        queryFn: () => getAnswerByQuestion(questionId),
        enabled: Boolean(questionId),
        retry: false,
    });
}

export function useEvaluateAnswer(roundId?: string) {
    const queryClient = useQueryClient();

    return useMutation<
        EvaluateAnswerResponse,
        ApiError,
        EvaluateAnswerPayload
    >({
        mutationFn: evaluateAnswer,
        onSuccess: (data, variables) => {
            queryClient.setQueryData(
                interviewAnswerKeys.byQuestion(variables.questionId),
                {
                    message: data.message,
                    answer: data.answer,
                }
            );
            if (roundId) {
                queryClient.invalidateQueries({
                    queryKey: [...interviewQuestionKeys.lists(), roundId],
                });
            } else {
                queryClient.invalidateQueries({
                    queryKey: interviewQuestionKeys.lists(),
                });
            }
        },
    });
}
