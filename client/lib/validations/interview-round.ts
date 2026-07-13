import { z } from "zod";

import { ROUND_STATUSES, ROUND_TYPES } from "@/types/interview-round";
import type {
    CreateInterviewRoundPayload,
    UpdateInterviewRoundPayload,
} from "@/types/interview-round";

const roundTypeSchema = z.enum(ROUND_TYPES);
const roundStatusSchema = z.enum(ROUND_STATUSES);

/**
 * Form schemas keep optional datetime/notes as strings (including "").
 * Convert via toCreatePayload / toUpdatePayload before calling the API.
 */
export const createInterviewRoundSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    roundType: roundTypeSchema,
    scheduledAt: z.string().trim(),
    notes: z.string().trim(),
});

export const updateInterviewRoundSchema = createInterviewRoundSchema.extend({
    status: roundStatusSchema,
});

export type CreateInterviewRoundFormValues = z.infer<
    typeof createInterviewRoundSchema
>;

export type UpdateInterviewRoundFormValues = z.infer<
    typeof updateInterviewRoundSchema
>;

/** Convert datetime-local value to ISO string, or omit if blank. */
function toIsoOrUndefined(value: string): string | undefined {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    return date.toISOString();
}

export function toCreateRoundPayload(
    interviewProcess: string,
    values: CreateInterviewRoundFormValues
): CreateInterviewRoundPayload {
    const scheduledAt = toIsoOrUndefined(values.scheduledAt);

    return {
        interviewProcess,
        title: values.title,
        roundType: values.roundType,
        ...(scheduledAt ? { scheduledAt } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
    };
}

export function toUpdateRoundPayload(
    values: UpdateInterviewRoundFormValues
): UpdateInterviewRoundPayload {
    return {
        title: values.title,
        roundType: values.roundType,
        status: values.status,
        scheduledAt: toIsoOrUndefined(values.scheduledAt),
        notes: values.notes,
    };
}

/** Format an ISO date for an HTML datetime-local input. */
export function toDatetimeLocalValue(iso?: string): string {
    if (!iso) {
        return "";
    }

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
