"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { forgotPasswordSchema } from "@/lib/validations/auth";
import { useForgotPassword } from "@/hooks/use-auth";

import LoadingButton from "@/components/shared/loading-button";
import { Input } from "@/components/ui/input";
import type { ApiError } from "@/types/api-error";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
    const forgotPasswordMutation = useForgotPassword();

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    function onSubmit(values: ForgotPasswordFormValues) {
        forgotPasswordMutation.mutate(values, {
            onSuccess: (data) => {
                toast.success(data.message);

                // Dev convenience: surface the reset link when the API returns it
                if (data.resetUrl) {
                    toast.message("Dev reset link", {
                        description: data.resetUrl,
                        duration: 15000,
                    });
                }

                form.reset();
            },
            onError: (error: ApiError) => {
                toast.error(
                    error.response?.data?.message ??
                        "Could not request a password reset"
                );
            },
        });
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    autoComplete="email"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <LoadingButton
                    type="submit"
                    className="w-full"
                    loading={forgotPasswordMutation.isPending}
                >
                    Send reset link
                </LoadingButton>
            </form>
        </Form>
    );
}
