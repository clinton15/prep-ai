import api from "./api";

import type {
    ArchiveInterviewProcessResponse,
    CreateInterviewProcessPayload,
    InterviewProcessListParams,
    InterviewProcessListResponse,
    InterviewProcessResponse,
    UpdateInterviewProcessPayload,
} from "@/types/interview-process";

/**
 * Builds query string from list filters, omitting empty values.
 */
function toQueryParams(params: InterviewProcessListParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.company) {
        searchParams.set("company", params.company);
    }

    if (params.role) {
        searchParams.set("role", params.role);
    }

    if (params.status) {
        searchParams.set("status", params.status);
    }

    if (params.page) {
        searchParams.set("page", String(params.page));
    }

    if (params.limit) {
        searchParams.set("limit", String(params.limit));
    }

    return searchParams.toString();
}

export const getInterviewProcesses = async (
    params: InterviewProcessListParams = {}
): Promise<InterviewProcessListResponse> => {
    const query = toQueryParams(params);
    const url = query ? `/processes?${query}` : "/processes";

    const response = await api.get(url);
    return response.data;
};

export const getInterviewProcess = async (
    id: string
): Promise<InterviewProcessResponse> => {
    const response = await api.get(`/processes/${id}`);
    return response.data;
};

export const createInterviewProcess = async (
    data: CreateInterviewProcessPayload
): Promise<InterviewProcessResponse> => {
    const response = await api.post("/processes", data);
    return response.data;
};

export const updateInterviewProcess = async (
    id: string,
    data: UpdateInterviewProcessPayload
): Promise<InterviewProcessResponse> => {
    const response = await api.put(`/processes/${id}`, data);
    return response.data;
};

export const archiveInterviewProcess = async (
    id: string
): Promise<ArchiveInterviewProcessResponse> => {
    const response = await api.delete(`/processes/${id}`);
    return response.data;
};
