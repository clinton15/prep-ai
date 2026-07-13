import { z } from "zod";

import { APPLICATION_STATUSES } from "@/types/interview-process";
import type {
    CreateInterviewProcessPayload,
    UpdateInterviewProcessPayload,
} from "@/types/interview-process";

const applicationStatusSchema = z.enum(APPLICATION_STATUSES);

/**
 * Form schemas keep optional fields as strings (including "").
 * Strip blanks before calling the API via toCreatePayload / toUpdatePayload.
 */
export const createInterviewProcessSchema = z.object({
    company: z.string().trim().min(1, "Company is required"),
    role: z.string().trim().min(1, "Role is required"),
    recruiter: z.string().trim(),
    jobUrl: z
        .string()
        .trim()
        .refine(
            (value) => value === "" || /^https?:\/\/.+/.test(value),
            "Invalid job URL"
        ),
    notes: z.string().trim(),
});

export const updateInterviewProcessSchema = createInterviewProcessSchema.extend({
    applicationStatus: applicationStatusSchema,
});

export type CreateInterviewProcessFormValues = z.infer<
    typeof createInterviewProcessSchema
>;

export type UpdateInterviewProcessFormValues = z.infer<
    typeof updateInterviewProcessSchema
>;

/** Omit blank optional fields for POST /processes. */
export function toCreatePayload(
    values: CreateInterviewProcessFormValues
): CreateInterviewProcessPayload {
    return {
        company: values.company,
        role: values.role,
        ...(values.recruiter ? { recruiter: values.recruiter } : {}),
        ...(values.jobUrl ? { jobUrl: values.jobUrl } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
    };
}

/** Build PUT /processes/:id body from the edit form. */
export function toUpdatePayload(
    values: UpdateInterviewProcessFormValues
): UpdateInterviewProcessPayload {
    return {
        company: values.company,
        role: values.role,
        applicationStatus: values.applicationStatus,
        recruiter: values.recruiter,
        jobUrl: values.jobUrl || undefined,
        notes: values.notes,
    };
}
