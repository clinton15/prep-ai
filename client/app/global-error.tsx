"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * This is the application's last-resort error screen.
 *
 * Next.js renders it when an uncaught error reaches the root layout or when
 * another error boundary cannot handle the error. Because it replaces the
 * root layout, providers and shared UI from app/layout.tsx are unavailable.
 *
 * Next.js requires a global error boundary to render its own <html> and
 * <body> elements for that reason.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
    // Log the original error in the browser console for debugging.
    // Do not display error.message because it may contain sensitive details.
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        // The normal root layout is not rendered on this screen, so this
        // component must provide the document elements itself.
        <html lang="en">
            <body className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16 text-center text-neutral-900">
                <h1 className="text-3xl font-bold tracking-tight">
                    Something went wrong
                </h1>
                <p className="mt-3 max-w-md text-neutral-600">
                    A critical error occurred. Please try again.
                </p>
                <button
                    type="button"
                    // reset() asks Next.js to render the failed route again
                    // without requiring the user to refresh the whole page.
                    onClick={reset}
                    className="mt-8 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
