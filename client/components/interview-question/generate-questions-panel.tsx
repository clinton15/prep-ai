"use client";

// import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
// import { FileUp, Loader2, X } from "lucide-react";

import {
    useGenerateQuestions,
    // useParseResume,
} from "@/hooks/use-interview-question";
import {
    generateQuestionsSchema,
    toGenerateQuestionsPayload,
    type GenerateQuestionsFormValues,
} from "@/lib/validations/interview-question";
import { toastAiError } from "@/lib/toast-ai-error";
import { GENERATE_DIFFICULTIES } from "@/types/interview-question";
import type { ApiError } from "@/types/api-error";

import LoadingButton from "@/components/shared/loading-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

// const ACCEPTED_RESUME_TYPES =
//     ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface GenerateQuestionsPanelProps {
    roundId: string;
    processId?: string;
    /** When true, questions already exist — generation is blocked server-side (409). */
    hasQuestions: boolean;
    disabled?: boolean;
    /** Prefill from interview process when previously saved. */
    initialJobDescription?: string;
    initialResumeText?: string;
}

/**
 * One-shot AI question generation for a round.
 * Optional JD context. Resume upload UI is temporarily disabled.
 */
export default function GenerateQuestionsPanel({
    roundId,
    processId,
    hasQuestions,
    disabled = false,
    initialJobDescription = "",
    initialResumeText = "",
}: GenerateQuestionsPanelProps) {
    const generateMutation = useGenerateQuestions(roundId, processId);
    // TODO: re-enable with resume upload UI
    // const parseResumeMutation = useParseResume();
    // const fileInputRef = useRef<HTMLInputElement>(null);
    // const [isDragging, setIsDragging] = useState(false);
    // const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    //     null
    // );

    const form = useForm<GenerateQuestionsFormValues>({
        resolver: zodResolver(generateQuestionsSchema),
        defaultValues: {
            numberOfQuestions: 10,
            difficulty: "Mixed",
            jobDescription: initialJobDescription,
            resumeText: initialResumeText,
        },
    });

    const busy = disabled || generateMutation.isPending;
    // || parseResumeMutation.isPending;

    // TODO: re-enable when resume upload UI is finished
    // const handleResumeFile = useCallback(
    //     (file: File | undefined) => {
    //         if (!file) return;
    //
    //         const lower = file.name.toLowerCase();
    //         const okExt = lower.endsWith(".pdf") || lower.endsWith(".docx");
    //         if (!okExt) {
    //             toast.error("Please upload a PDF or DOCX resume");
    //             return;
    //         }
    //
    //         parseResumeMutation.mutate(file, {
    //             onSuccess: (data) => {
    //                 form.setValue("resumeText", data.text, {
    //                     shouldDirty: true,
    //                     shouldValidate: true,
    //                 });
    //                 setUploadedFileName(data.fileName);
    //                 toast.success(
    //                     "Resume text extracted — review and edit if needed"
    //                 );
    //             },
    //             onError: (error: ApiError) => {
    //                 toast.error(
    //                     error.response?.data?.message ??
    //                         "Failed to parse resume"
    //                 );
    //             },
    //         });
    //     },
    //     [form, parseResumeMutation]
    // );

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
                    toastAiError(error, {
                        fallback: "Failed to generate questions",
                        onRetry: () => onSubmit(values),
                    });
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
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs"
                noValidate
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
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
                                        disabled={busy}
                                        name={field.name}
                                        ref={field.ref}
                                        onBlur={field.onBlur}
                                        value={field.value}
                                        onChange={(event) => {
                                            const next =
                                                event.target.valueAsNumber;
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
                                        disabled={busy}
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
                </div>

                <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Job description{" "}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Paste the job description to ground questions in the role requirements…"
                                    className="min-h-28"
                                    disabled={busy}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Copy-paste from the job posting. Leave blank for
                                generic role-based questions.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* TODO: re-enable when resume upload UI is finished
                <div className="space-y-2">
                    <FormLabel>
                        Resume{" "}
                        <span className="font-normal text-muted-foreground">
                            (optional)
                        </span>
                    </FormLabel>
                    <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                if (!busy) fileInputRef.current?.click();
                            }
                        }}
                        onDragEnter={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (!busy) setIsDragging(true);
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (!busy) setIsDragging(true);
                        }}
                        onDragLeave={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setIsDragging(false);
                        }}
                        onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setIsDragging(false);
                            if (busy) return;
                            handleResumeFile(event.dataTransfer.files?.[0]);
                        }}
                        onClick={() => {
                            if (!busy) fileInputRef.current?.click();
                        }}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
                            isDragging
                                ? "border-foreground bg-muted/40"
                                : "border-border bg-muted/10 hover:bg-muted/20"
                        } ${busy ? "pointer-events-none opacity-50" : ""}`}
                    >
                        {parseResumeMutation.isPending ? (
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                        ) : (
                            <FileUp className="size-5 text-muted-foreground" />
                        )}
                        <p className="text-sm text-muted-foreground">
                            {parseResumeMutation.isPending
                                ? "Extracting text…"
                                : "Drop a PDF or DOCX here, or click to browse"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Max 5MB. File is parsed only — not stored.
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_RESUME_TYPES}
                            className="sr-only"
                            disabled={busy}
                            onChange={(event) => {
                                handleResumeFile(event.target.files?.[0]);
                                event.target.value = "";
                            }}
                        />
                    </div>
                    {uploadedFileName ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Parsed from {uploadedFileName}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1"
                                disabled={busy}
                                onClick={() => {
                                    setUploadedFileName(null);
                                    form.setValue("resumeText", "", {
                                        shouldDirty: true,
                                    });
                                }}
                            >
                                <X className="size-3.5" />
                                Clear
                            </Button>
                        </div>
                    ) : null}
                </div>

                <FormField
                    control={form.control}
                    name="resumeText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Resume text{" "}
                                <span className="font-normal text-muted-foreground">
                                    (editable)
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Upload a resume above, or paste resume text here…"
                                    className="min-h-36 font-mono text-xs md:text-xs"
                                    disabled={busy}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Fix parsing artifacts before generating.
                                Scanned/image PDFs won&apos;t extract text.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                */}

                <LoadingButton
                    type="submit"
                    loading={generateMutation.isPending}
                    disabled={busy && !generateMutation.isPending}
                    className="w-full sm:w-auto"
                >
                    Generate questions
                </LoadingButton>
            </form>
        </Form>
    );
}
