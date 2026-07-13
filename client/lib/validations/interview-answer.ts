import { z } from "zod";

import type { EvaluateAnswerPayload } from "@/types/interview-answer";

export const evaluateAnswerSchema = z.object({
    answer: z.string().trim().min(1, "Answer is required"),
});

export type EvaluateAnswerFormValues = z.infer<typeof evaluateAnswerSchema>;

export function toEvaluateAnswerPayload(
    questionId: string,
    values: EvaluateAnswerFormValues
): EvaluateAnswerPayload {
    return {
        questionId,
        answer: values.answer,
    };
}
