"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Root error boundary (replaces root layout when it fails).
 * Must render its own html/body.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
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
                    onClick={reset}
                    className="mt-8 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
