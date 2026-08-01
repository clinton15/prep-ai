"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { forgotPasswordSchema } from "@/lib/validations/auth";
import { useForgotPassword } from "@/hooks/use-auth";

import LoadingButton from "@/components/shared/loading-button";
import { Button } from "@/components/ui/button";
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

/**
 * Personal-use flow: no email. API returns resetUrl; we send the user there.
 */
export default function ForgotPasswordForm() {
    const router = useRouter();
    const forgotPasswordMutation = useForgotPassword();
    const [resetUrl, setResetUrl] = useState<string | null>(null);

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

                if (data.resetUrl) {
                    setResetUrl(data.resetUrl);
                    // Prefer relative path when CLIENT_URL matches this app
                    try {
                        const url = new URL(data.resetUrl);
                        router.push(`${url.pathname}${url.search}`);
                        return;
                    } catch {
                        router.push(data.resetUrl);
                        return;
                    }
                }

                form.reset();
                setResetUrl(null);
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
                    Get reset link
                </LoadingButton>

                {resetUrl ? (
                    <p className="text-center text-sm text-muted-foreground">
                        If you weren’t redirected,{" "}
                        <Button
                            asChild
                            variant="link"
                            className="h-auto p-0 text-sm"
                        >
                            <a href={resetUrl}>open the reset page</a>
                        </Button>
                        .
                    </p>
                ) : null}
            </form>
        </Form>
    );
}
