"use client";

import { useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    createInterviewProcessSchema,
    updateInterviewProcessSchema,
    type CreateInterviewProcessFormValues,
    type UpdateInterviewProcessFormValues,
} from "@/lib/validations/interview-process";
import { APPLICATION_STATUSES } from "@/types/interview-process";
import type { InterviewProcess } from "@/types/interview-process";

import LoadingButton from "@/components/shared/loading-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

type CreateProps = {
    mode: "create";
    defaultValues?: Partial<CreateInterviewProcessFormValues>;
    onSubmit: (values: CreateInterviewProcessFormValues) => void;
    isSubmitting?: boolean;
    submitLabel?: string;
};

type EditProps = {
    mode: "edit";
    process: InterviewProcess;
    onSubmit: (values: UpdateInterviewProcessFormValues) => void;
    isSubmitting?: boolean;
    submitLabel?: string;
};

type InterviewProcessFormProps = CreateProps | EditProps;

/**
 * Shared create / edit form for interview processes.
 * Create omits applicationStatus (server defaults to Applied).
 */
export default function InterviewProcessForm(
    props: InterviewProcessFormProps
) {
    const isEdit = props.mode === "edit";
    const isSubmitting = props.isSubmitting ?? false;
    const submitLabel =
        props.submitLabel ?? (isEdit ? "Save changes" : "Create process");

    if (isEdit) {
        return (
            <EditForm
                process={props.process}
                onSubmit={props.onSubmit}
                isSubmitting={isSubmitting}
                submitLabel={submitLabel}
            />
        );
    }

    return (
        <CreateForm
            defaultValues={props.defaultValues}
            onSubmit={props.onSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
        />
    );
}

function CreateForm({
    defaultValues,
    onSubmit,
    isSubmitting,
    submitLabel,
}: {
    defaultValues?: Partial<CreateInterviewProcessFormValues>;
    onSubmit: (values: CreateInterviewProcessFormValues) => void;
    isSubmitting: boolean;
    submitLabel: string;
}) {
    const form = useForm<CreateInterviewProcessFormValues>({
        resolver: zodResolver(createInterviewProcessSchema),
        defaultValues: {
            company: "",
            role: "",
            recruiter: "",
            jobUrl: "",
            notes: "",
            ...defaultValues,
        },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
            >
                <SharedFields control={form.control} />

                <LoadingButton
                    type="submit"
                    loading={isSubmitting}
                    className="w-full sm:w-auto"
                >
                    {submitLabel}
                </LoadingButton>
            </form>
        </Form>
    );
}

function EditForm({
    process,
    onSubmit,
    isSubmitting,
    submitLabel,
}: {
    process: InterviewProcess;
    onSubmit: (values: UpdateInterviewProcessFormValues) => void;
    isSubmitting: boolean;
    submitLabel: string;
}) {
    const form = useForm<UpdateInterviewProcessFormValues>({
        resolver: zodResolver(updateInterviewProcessSchema),
        defaultValues: {
            company: process.company,
            role: process.role,
            recruiter: process.recruiter ?? "",
            jobUrl: process.jobUrl ?? "",
            notes: process.notes ?? "",
            applicationStatus: process.applicationStatus,
        },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
            >
                <SharedFields
                    control={
                        form.control as unknown as Control<CreateInterviewProcessFormValues>
                    }
                />

                <FormField
                    control={form.control}
                    name="applicationStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <Select {...field}>
                                    {APPLICATION_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <LoadingButton
                    type="submit"
                    loading={isSubmitting}
                    className="w-full sm:w-auto"
                >
                    {submitLabel}
                </LoadingButton>
            </form>
        </Form>
    );
}

function SharedFields({
    control,
}: {
    control: Control<CreateInterviewProcessFormValues>;
}) {
    return (
        <>
            <FormField
                control={control}
                name="company"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Acme Inc."
                                autoComplete="organization"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Frontend Engineer"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="recruiter"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Recruiter (optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="jobUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job URL (optional)</FormLabel>
                        <FormControl>
                            <Input
                                type="url"
                                placeholder="https://..."
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes (optional)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Anything helpful for this application..."
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
