"use client";

import Link from "next/link";

import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import LoadingButton from "@/components/shared/loading-button";

interface AppLayoutProps {
    children: React.ReactNode;
    /** Optional page title shown in the header. */
    title?: string;
}

/**
 * Shared shell for authenticated pages.
 *
 * Top header + content container only.
 * Full navigation / sidebar will be added once more pages exist.
 */
export default function AppLayout({
    children,
    title,
}: AppLayoutProps) {
    const { data: user } = useCurrentUser();
    const logoutMutation = useLogout();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
                <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-6">
                        <Link
                            href="/dashboard"
                            className="shrink-0 text-lg font-bold tracking-tight"
                        >
                            PrepAI
                        </Link>

                        {title ? (
                            <span className="truncate text-sm text-muted-foreground">
                                {title}
                            </span>
                        ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        {user?.name ? (
                            <span
                                className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline"
                                title={user.name}
                            >
                                {user.name}
                            </span>
                        ) : null}

                        <LoadingButton
                            type="button"
                            variant="outline"
                            size="sm"
                            loading={logoutMutation.isPending}
                            aria-label="Log out"
                            onClick={() => logoutMutation.mutate()}
                        >
                            Logout
                        </LoadingButton>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
                {children}
            </main>
        </div>
    );
}
