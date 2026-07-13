import api from "./api";

import type {
    EvaluateAnswerPayload,
    EvaluateAnswerResponse,
    GetAnswerResponse,
} from "@/types/interview-answer";

export const evaluateAnswer = async (
    data: EvaluateAnswerPayload
): Promise<EvaluateAnswerResponse> => {
    const response = await api.post("/answers/evaluate", data);
    return response.data;
};

export const getAnswerByQuestion = async (
    questionId: string
): Promise<GetAnswerResponse> => {
    const response = await api.get(
        `/answers/question/${questionId}`
    );
    return response.data;
};
