import api from "./api";

import type {
    GenerateQuestionsPayload,
    InterviewQuestionResponse,
    InterviewQuestionsResponse,
    QuestionFilters,
    UpdateQuestionPayload,
} from "@/types/interview-question";

function toQueryParams(filters?: QuestionFilters) {
    if (!filters) {
        return undefined;
    }

    const params: Record<string, string> = {};

    if (filters.topic) params.topic = filters.topic;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.status) params.status = filters.status;
    if (filters.bookmarked !== undefined) {
        params.bookmarked = String(filters.bookmarked);
    }
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    if (filters.order) params.order = filters.order;
    if (filters.includeFollowUps !== undefined) {
        params.includeFollowUps = String(filters.includeFollowUps);
    }

    return params;
}

export const generateQuestions = async (
    data: GenerateQuestionsPayload
): Promise<InterviewQuestionsResponse> => {
    const response = await api.post("/questions/generate", data);
    return response.data;
};

export const getQuestionsByRound = async (
    roundId: string,
    filters?: QuestionFilters
): Promise<InterviewQuestionsResponse> => {
    const response = await api.get(`/questions/${roundId}`, {
        params: toQueryParams(filters),
    });
    return response.data;
};

export const updateQuestion = async (
    questionId: string,
    data: UpdateQuestionPayload
): Promise<InterviewQuestionResponse> => {
    const response = await api.patch(`/questions/${questionId}`, data);
    return response.data;
};

export const generateFollowUps = async (
    questionId: string
): Promise<InterviewQuestionsResponse> => {
    const response = await api.post(
        `/questions/${questionId}/follow-ups`
    );
    return response.data;
};
