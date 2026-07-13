"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useGenerateQuestions } from "@/hooks/use-interview-question";
import {
    generateQuestionsSchema,
    toGenerateQuestionsPayload,
    type GenerateQuestionsFormValues,
} from "@/lib/validations/interview-question";
import { GENERATE_DIFFICULTIES } from "@/types/interview-question";
import type { ApiError } from "@/types/api-error";

import LoadingButton from "@/components/shared/loading-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

interface GenerateQuestionsPanelProps {
    roundId: string;
    /** When true, questions already exist — generation is blocked server-side (409). */
    hasQuestions: boolean;
    disabled?: boolean;
}

/**
 * One-shot AI question generation for a round.
 * Backend returns 409 if questions already exist.
 */
export default function GenerateQuestionsPanel({
    roundId,
    hasQuestions,
    disabled = false,
}: GenerateQuestionsPanelProps) {
    const generateMutation = useGenerateQuestions(roundId);

    const form = useForm<GenerateQuestionsFormValues>({
        resolver: zodResolver(generateQuestionsSchema),
        defaultValues: {
            numberOfQuestions: 10,
            difficulty: "Mixed",
        },
    });

    function onSubmit(values: GenerateQuestionsFormValues) {
        generateMutation.mutate(
            toGenerateQuestionsPayload(roundId, values),
            {
                onSuccess: (data) => {
                    toast.success(
                        data.message ??
                            `Generated ${data.questions.length} questions`
                    );
                },
                onError: (error: ApiError) => {
                    const status = error.response?.status;
                    const message =
                        error.response?.data?.message ??
                        "Failed to generate questions";

                    if (status === 409) {
                        toast.error(message);
                        return;
                    }

                    toast.error(message);
                },
            }
        );
    }

    if (hasQuestions) {
        return (
            <p className="rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                Questions already generated for this round. Generation is
                one-time per round.
            </p>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:flex-wrap sm:items-end"
                noValidate
            >
                <FormField
                    control={form.control}
                    name="numberOfQuestions"
                    render={({ field }) => (
                        <FormItem className="min-w-40 flex-1">
                            <FormLabel>Number of questions</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    max={50}
                                    disabled={
                                        disabled || generateMutation.isPending
                                    }
                                    name={field.name}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                    value={field.value}
                                    onChange={(event) => {
                                        const next = event.target.valueAsNumber;
                                        field.onChange(
                                            Number.isNaN(next) ? 0 : next
                                        );
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <FormItem className="min-w-40 flex-1">
                            <FormLabel>Difficulty</FormLabel>
                            <FormControl>
                                <Select
                                    disabled={
                                        disabled || generateMutation.isPending
                                    }
                                    name={field.name}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                    value={field.value}
                                    onChange={field.onChange}
                                >
                                    {GENERATE_DIFFICULTIES.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormDescription>
                                Mixed balances Easy, Medium, and Hard.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <LoadingButton
                    type="submit"
                    loading={generateMutation.isPending}
                    disabled={disabled}
                    className="w-full sm:w-auto"
                >
                    Generate questions
                </LoadingButton>
            </form>
        </Form>
    );
}
