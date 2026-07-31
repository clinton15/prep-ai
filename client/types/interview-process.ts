/** Application status values — mirrors the Mongoose / Zod enums on the server. */
export const APPLICATION_STATUSES = [
    "Applied",
    "Screening",
    "Interviewing",
    "Offer",
    "Rejected",
    "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface InterviewProcess {
    _id: string;
    user: string;
    company: string;
    role: string;
    applicationStatus: ApplicationStatus;
    recruiter?: string;
    jobUrl?: string;
    notes?: string;
    jobDescription?: string;
    resumeText?: string;
    appliedDate: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInterviewProcessPayload {
    company: string;
    role: string;
    recruiter?: string;
    jobUrl?: string;
    notes?: string;
}

export interface UpdateInterviewProcessPayload {
    company?: string;
    role?: string;
    recruiter?: string;
    jobUrl?: string;
    notes?: string;
    applicationStatus?: ApplicationStatus;
}

export interface InterviewProcessListParams {
    company?: string;
    role?: string;
    status?: ApplicationStatus | "";
    page?: number;
    limit?: number;
}

export interface InterviewProcessListResponse {
    message: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    interviewProcesses: InterviewProcess[];
}

export interface InterviewProcessResponse {
    message: string;
    interviewProcess: InterviewProcess;
}

export interface ArchiveInterviewProcessResponse {
    message: string;
}
