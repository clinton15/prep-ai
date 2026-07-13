"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Protects authenticated pages.
 *
 * Flow:
 * Loading -> Show skeleton
 * Authenticated -> Render page
 * Unauthenticated -> Redirect to login
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();

    const { data: user, isLoading, isError } = useCurrentUser();

    useEffect(() => {
        if (!isLoading && (isError || !user)) {
            router.replace("/login");
        }
    }, [isLoading, isError, user, router]);

    if (isLoading) {
        return (
            <div
                className="flex min-h-svh"
                aria-busy="true"
                aria-label="Checking authentication"
            >
                <aside className="hidden w-64 shrink-0 border-r bg-sidebar p-3 md:block">
                    <Skeleton className="mb-6 h-7 w-28" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </aside>
                <div className="flex flex-1 flex-col">
                    <div className="flex h-12 items-center border-b px-4">
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 p-6">
                        <Skeleton className="h-8 w-56" />
                        <Skeleton className="h-4 w-72" />
                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
