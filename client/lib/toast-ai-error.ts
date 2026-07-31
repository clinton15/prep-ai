import { toast } from "sonner";

import type { ApiError } from "@/types/api-error";

interface ToastAiErrorOptions {
    fallback?: string;
    onRetry?: () => void;
}

/**
 * Surfaces AI / rate-limit API errors with an optional "Try again" action.
 */
export function toastAiError(
    error: ApiError,
    options: ToastAiErrorOptions = {}
) {
    const code = error.response?.data?.code;
    const status = error.response?.status;
    const apiMessage = error.response?.data?.message;

    let message =
        apiMessage ??
        options.fallback ??
        "AI request failed. Please try again.";

    if (status === 429 || code === "RATE_LIMITED") {
        message =
            apiMessage ??
            "AI rate limit reached. Please wait and try again.";
    } else if (status === 502 || code === "AI_UNAVAILABLE") {
        message =
            apiMessage ??
            "AI is temporarily unavailable. Please try again.";
    }

    if (options.onRetry) {
        toast.error(message, {
            action: {
                label: "Try again",
                onClick: () => options.onRetry?.(),
            },
            duration: 8000,
        });
        return;
    }

    toast.error(message);
}
