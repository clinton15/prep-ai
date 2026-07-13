import api from "./api";

import type {
    ArchiveInterviewRoundResponse,
    CreateInterviewRoundPayload,
    InterviewRoundListResponse,
    InterviewRoundResponse,
    UpdateInterviewRoundPayload,
} from "@/types/interview-round";

export const getInterviewRounds =
    async (): Promise<InterviewRoundListResponse> => {
        const response = await api.get("/rounds");
        return response.data;
    };

export const getInterviewRound = async (
    id: string
): Promise<InterviewRoundResponse> => {
    const response = await api.get(`/rounds/${id}`);
    return response.data;
};

export const createInterviewRound = async (
    data: CreateInterviewRoundPayload
): Promise<InterviewRoundResponse> => {
    const response = await api.post("/rounds", data);
    return response.data;
};

export const updateInterviewRound = async (
    id: string,
    data: UpdateInterviewRoundPayload
): Promise<InterviewRoundResponse> => {
    const response = await api.put(`/rounds/${id}`, data);
    return response.data;
};

export const archiveInterviewRound = async (
    id: string
): Promise<ArchiveInterviewRoundResponse> => {
    const response = await api.delete(`/rounds/${id}`);
    return response.data;
};
