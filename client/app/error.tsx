"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Route-level error UI. Lets users retry without a full reload.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="auth-surface flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Error
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Something went wrong
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                An unexpected error occurred. You can try again or return to a
                safe page.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button type="button" onClick={reset}>
                    Try again
                </Button>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Go to dashboard</Link>
                </Button>
            </div>
        </main>
    );
}
