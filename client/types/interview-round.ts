export const ROUND_TYPES = ["AI Mock", "Real"] as const;
export type RoundType = (typeof ROUND_TYPES)[number];

export const ROUND_STATUSES = [
    "Upcoming",
    "Completed",
    "Cancelled",
] as const;
export type RoundStatus = (typeof ROUND_STATUSES)[number];

/** Populated process summary returned by GET /rounds list. */
export interface InterviewProcessSummary {
    _id: string;
    company: string;
    role: string;
}

export interface InterviewRound {
    _id: string;
    /** ObjectId string on get-by-id; populated summary on list. */
    interviewProcess: string | InterviewProcessSummary;
    title: string;
    roundType: RoundType;
    status: RoundStatus;
    scheduledAt?: string;
    score?: number;
    feedback?: string;
    notes?: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInterviewRoundPayload {
    interviewProcess: string;
    title: string;
    roundType: RoundType;
    scheduledAt?: string;
    notes?: string;
}

export interface UpdateInterviewRoundPayload {
    title?: string;
    roundType?: RoundType;
    status?: RoundStatus;
    scheduledAt?: string;
    notes?: string;
}

export interface InterviewRoundListResponse {
    message: string;
    interviewRounds: InterviewRound[];
}

export interface InterviewRoundResponse {
    message: string;
    interviewRound: InterviewRound;
}

export interface ArchiveInterviewRoundResponse {
    message: string;
}

/** Normalize process id whether list (populated) or detail (ObjectId string). */
export function getRoundProcessId(round: InterviewRound): string {
    if (typeof round.interviewProcess === "string") {
        return round.interviewProcess;
    }

    return round.interviewProcess._id;
}
