"use client";

import { useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    createInterviewRoundSchema,
    updateInterviewRoundSchema,
    toDatetimeLocalValue,
    type CreateInterviewRoundFormValues,
    type UpdateInterviewRoundFormValues,
} from "@/lib/validations/interview-round";
import { ROUND_STATUSES, ROUND_TYPES } from "@/types/interview-round";
import type { InterviewRound } from "@/types/interview-round";

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
    onSubmit: (values: CreateInterviewRoundFormValues) => void;
    isSubmitting?: boolean;
    submitLabel?: string;
};

type EditProps = {
    mode: "edit";
    round: InterviewRound;
    onSubmit: (values: UpdateInterviewRoundFormValues) => void;
    isSubmitting?: boolean;
    submitLabel?: string;
};

type InterviewRoundFormProps = CreateProps | EditProps;

/**
 * Shared create / edit form for interview rounds.
 * Create omits status (server defaults to Upcoming).
 */
export default function InterviewRoundForm(props: InterviewRoundFormProps) {
    const isEdit = props.mode === "edit";
    const isSubmitting = props.isSubmitting ?? false;
    const submitLabel =
        props.submitLabel ?? (isEdit ? "Save changes" : "Add round");

    if (isEdit) {
        return (
            <EditForm
                round={props.round}
                onSubmit={props.onSubmit}
                isSubmitting={isSubmitting}
                submitLabel={submitLabel}
            />
        );
    }

    return (
        <CreateForm
            onSubmit={props.onSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
        />
    );
}

function CreateForm({
    onSubmit,
    isSubmitting,
    submitLabel,
}: {
    onSubmit: (values: CreateInterviewRoundFormValues) => void;
    isSubmitting: boolean;
    submitLabel: string;
}) {
    const form = useForm<CreateInterviewRoundFormValues>({
        resolver: zodResolver(createInterviewRoundSchema),
        defaultValues: {
            title: "",
            roundType: "AI Mock",
            scheduledAt: "",
            notes: "",
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
    round,
    onSubmit,
    isSubmitting,
    submitLabel,
}: {
    round: InterviewRound;
    onSubmit: (values: UpdateInterviewRoundFormValues) => void;
    isSubmitting: boolean;
    submitLabel: string;
}) {
    const form = useForm<UpdateInterviewRoundFormValues>({
        resolver: zodResolver(updateInterviewRoundSchema),
        defaultValues: {
            title: round.title,
            roundType: round.roundType,
            status: round.status,
            scheduledAt: toDatetimeLocalValue(round.scheduledAt),
            notes: round.notes ?? "",
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
                        form.control as unknown as Control<CreateInterviewRoundFormValues>
                    }
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <Select {...field}>
                                    {ROUND_STATUSES.map((status) => (
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
    control: Control<CreateInterviewRoundFormValues>;
}) {
    return (
        <>
            <FormField
                control={control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Technical screen"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="roundType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Round type</FormLabel>
                        <FormControl>
                            <Select {...field}>
                                {ROUND_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="scheduledAt"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Scheduled at (optional)</FormLabel>
                        <FormControl>
                            <Input type="datetime-local" {...field} />
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
                                placeholder="Prep notes for this round..."
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
