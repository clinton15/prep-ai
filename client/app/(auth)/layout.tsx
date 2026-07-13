/**
 * Nested layout for auth pages (login / register).
 * Clerk-inspired centered auth surface with subtle atmosphere.
 */
import Link from "next/link";

import ThemeToggle from "@/components/shared/theme-toggle";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="auth-surface relative flex min-h-full flex-1 flex-col">
            <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
                <Link
                    href="/"
                    className="mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80"
                >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                        P
                    </span>
                    <span className="text-lg font-semibold tracking-tight">
                        PrepAI
                    </span>
                </Link>

                <div
                    id="main-content"
                    tabIndex={-1}
                    className="w-full max-w-[400px] animate-fade-up outline-none"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
