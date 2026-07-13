"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DEMO_CREDENTIALS } from "@/lib/demo";
import {
    CURRENT_USER_QUERY_KEY,
    useLogin,
} from "@/hooks/use-auth";
import type { ApiError } from "@/types/api-error";
import LoadingButton from "@/components/shared/loading-button";

interface DemoLoginButtonProps {
    className?: string;
    variant?: "link" | "outline";
}

/**
 * One-click login with the seeded demo account for recruiter walkthroughs.
 */
export default function DemoLoginButton({
    className,
    variant = "outline",
}: DemoLoginButtonProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const loginMutation = useLogin();

    function handleDemoLogin() {
        loginMutation.mutate(DEMO_CREDENTIALS, {
            onSuccess: (data) => {
                queryClient.setQueryData(
                    CURRENT_USER_QUERY_KEY,
                    data.user
                );
                toast.success("Signed in as demo user");
                router.replace("/dashboard");
            },
            onError: (error: ApiError) => {
                toast.error(
                    error.response?.data?.message ??
                        "Demo login failed. Seed the demo user on the API first."
                );
            },
        });
    }

    if (variant === "link") {
        return (
            <button
                type="button"
                className={
                    className ??
                    "font-medium text-foreground underline-offset-4 transition-colors hover:underline disabled:opacity-50"
                }
                disabled={loginMutation.isPending}
                onClick={handleDemoLogin}
            >
                {loginMutation.isPending
                    ? "Signing in…"
                    : "Login as guest / demo"}
            </button>
        );
    }

    return (
        <LoadingButton
            type="button"
            variant="outline"
            className={className ?? "w-full"}
            loading={loginMutation.isPending}
            onClick={handleDemoLogin}
        >
            Login as guest / demo
        </LoadingButton>
    );
}
