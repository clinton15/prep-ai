import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Global 404 page for unknown routes.
 */
export default function NotFound() {
    return (
        <main className="auth-surface flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                404
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Page not found
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                The page you are looking for does not exist or may have been
                moved.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild>
                    <Link href="/dashboard">Go to dashboard</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/">Home</Link>
                </Button>
            </div>
        </main>
    );
}
