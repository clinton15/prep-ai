export interface InterviewAnswer {
    _id: string;
    user: string;
    interviewQuestion: string;
    answer: string;
    score: number;
    technicalScore?: number;
    communicationScore?: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    missingConcepts?: string[];
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EvaluateAnswerPayload {
    questionId: string;
    answer: string;
}

export interface EvaluateAnswerResponse {
    message: string;
    answer: InterviewAnswer;
}

export interface GetAnswerResponse {
    message: string;
    answer: InterviewAnswer | null;
}
