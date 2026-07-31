export const QUESTION_DIFFICULTIES = [
    "Easy",
    "Medium",
    "Hard",
] as const;

export const GENERATE_DIFFICULTIES = [
    "Easy",
    "Medium",
    "Hard",
    "Mixed",
] as const;

export const QUESTION_STATUSES = [
    "Generated",
    "Practiced",
    "Completed",
] as const;

export type QuestionDifficulty =
    (typeof QUESTION_DIFFICULTIES)[number];

export type GenerateDifficulty =
    (typeof GENERATE_DIFFICULTIES)[number];

export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export interface InterviewQuestion {
    _id: string;
    interviewRound: string;
    question: string;
    /** Omitted from list/fetch APIs; loaded via reveal endpoint. */
    expectedAnswer?: string;
    topic: string;
    difficulty: QuestionDifficulty;
    order: number;
    status: QuestionStatus;
    isAnswered: boolean;
    isBookmarked: boolean;
    notes: string;
    parentQuestion: string | null;
    isFollowUp: boolean;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExpectedAnswerResponse {
    message: string;
    expectedAnswer: string;
}

export interface GenerateQuestionsPayload {
    interviewRoundId: string;
    numberOfQuestions?: number;
    difficulty?: GenerateDifficulty;
    jobDescription?: string;
    resumeText?: string;
}

export interface ParseResumeResponse {
    message: string;
    text: string;
    fileName: string;
}

export interface UpdateQuestionPayload {
    isBookmarked?: boolean;
    notes?: string;
    status?: QuestionStatus;
}

export interface QuestionFilters {
    topic?: string;
    difficulty?: QuestionDifficulty;
    status?: QuestionStatus;
    bookmarked?: boolean;
    search?: string;
    sort?: "order" | "difficulty" | "topic" | "createdAt" | "status";
    order?: "asc" | "desc";
    includeFollowUps?: boolean;
}

export interface InterviewQuestionsResponse {
    message: string;
    questions: InterviewQuestion[];
}

export interface InterviewQuestionResponse {
    message: string;
    question: InterviewQuestion;
}
