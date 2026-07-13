import { z } from "zod";

import type { GenerateQuestionsPayload } from "@/types/interview-question";
import { GENERATE_DIFFICULTIES } from "@/types/interview-question";

export const generateQuestionsSchema = z.object({
    numberOfQuestions: z
        .number({ error: "Enter a number" })
        .int("Must be a whole number")
        .min(1, "At least 1 question")
        .max(50, "Cannot exceed 50 questions"),
    difficulty: z.enum(GENERATE_DIFFICULTIES),
});

export type GenerateQuestionsFormValues = z.infer<
    typeof generateQuestionsSchema
>;

export function toGenerateQuestionsPayload(
    interviewRoundId: string,
    values: GenerateQuestionsFormValues
): GenerateQuestionsPayload {
    return {
        interviewRoundId,
        numberOfQuestions: values.numberOfQuestions,
        difficulty: values.difficulty,
    };
}
