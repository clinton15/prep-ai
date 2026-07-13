"use client";

import Link from "next/link";

import type { ApiError } from "@/types/api-error";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QueryErrorProps {
    error?: ApiError | null;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

function resolveCopy(error?: ApiError | null, fallback?: string) {
    const status = error?.response?.status;
    const apiMessage = error?.response?.data?.message;

    if (status === 401) {
        return {
            title: "Session expired",
            description:
                apiMessage ?? "Please sign in again to continue.",
            showLogin: true,
        };
    }

    if (!error?.response && error?.message === "Network Error") {
        return {
            title: "Network error",
            description:
                "Unable to reach the server. Check your connection and try again.",
            showLogin: false,
        };
    }

    return {
        title: "Something went wrong",
        description:
            apiMessage ?? fallback ?? "Failed to load data. Please try again.",
        showLogin: false,
    };
}

/**
 * Reusable inline error for TanStack Query failures.
 */
export default function QueryError({
    error,
    message,
    onRetry,
    className,
}: QueryErrorProps) {
    const copy = resolveCopy(error, message);

    return (
        <div
            className={cn(
                "rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-5",
                className
            )}
            role="alert"
        >
            <p className="text-sm font-medium text-destructive">
                {copy.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                {copy.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                {onRetry ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                    >
                        Retry
                    </Button>
                ) : null}
                {copy.showLogin ? (
                    <Button asChild size="sm">
                        <Link href="/login">Sign in</Link>
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
