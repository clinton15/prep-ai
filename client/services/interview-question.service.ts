import api from "./api";

import type {
    ExpectedAnswerResponse,
    GenerateQuestionsPayload,
    InterviewQuestionResponse,
    InterviewQuestionsResponse,
    ParseResumeResponse,
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

export const parseResume = async (
    file: File
): Promise<ParseResumeResponse> => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await api.post("/questions/parse-resume", formData, {
        // Override instance JSON default; Axios sets the multipart boundary
        headers: { "Content-Type": "multipart/form-data" },
    });
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

export const getExpectedAnswer = async (
    questionId: string
): Promise<ExpectedAnswerResponse> => {
    const response = await api.get(
        `/questions/${questionId}/expected-answer`
    );
    return response.data;
};
