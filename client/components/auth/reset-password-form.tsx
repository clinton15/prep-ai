"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { resetPasswordSchema } from "@/lib/validations/auth";
import { useResetPassword } from "@/hooks/use-auth";

import LoadingButton from "@/components/shared/loading-button";
import PasswordInput from "@/components/auth/password-input";
import type { ApiError } from "@/types/api-error";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
    token: string;
}

export default function ResetPasswordForm({
    token,
}: ResetPasswordFormProps) {
    const router = useRouter();
    const resetPasswordMutation = useResetPassword();

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    function onSubmit(values: ResetPasswordFormValues) {
        resetPasswordMutation.mutate(
            {
                token,
                password: values.password,
            },
            {
                onSuccess: (data) => {
                    toast.success(data.message);
                    router.replace("/login");
                },
                onError: (error: ApiError) => {
                    toast.error(
                        error.response?.data?.message ??
                            "Could not reset password"
                    );
                },
            }
        );
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
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New password</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm password</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    autoComplete="new-password"
                                    placeholder="••••••••"
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
                    loading={resetPasswordMutation.isPending}
                >
                    Reset password
                </LoadingButton>
            </form>
        </Form>
    );
}
