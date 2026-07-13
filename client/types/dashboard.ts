import type { ApplicationStatus } from "@/types/interview-process";

export interface DashboardApplicationsSummary {
    total: number;
    applied: number;
    screening: number;
    interviewing: number;
    offers: number;
    rejected: number;
    withdrawn: number;
}

export interface DashboardRoundsSummary {
    total: number;
    completed: number;
    /** Upcoming rounds (backend field name remains `pending`). */
    pending: number;
}

export interface DashboardQuestionsSummary {
    generated: number;
    answered: number;
    practiced: number;
    completed: number;
    completionPercentage: number;
}

export interface DashboardPerformanceSummary {
    averageScore: number;
}

export interface DashboardTopicStat {
    topic: string;
    count: number;
    averageScore: number;
}

export interface DashboardSummary {
    applications: DashboardApplicationsSummary;
    rounds: DashboardRoundsSummary;
    questions: DashboardQuestionsSummary;
    performance: DashboardPerformanceSummary;
    topTopics: DashboardTopicStat[];
    weakTopics: DashboardTopicStat[];
}

export interface DashboardRecentActivityItem {
    _id: string;
    company: string;
    role: string;
    applicationStatus: ApplicationStatus;
    updatedAt: string;
}

export interface DashboardResponse {
    summary: DashboardSummary;
    recentActivity: DashboardRecentActivityItem[];
}
