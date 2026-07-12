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
export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const router = useRouter();

    const {
        data: user,
        isLoading,
        isError,
    } = useCurrentUser();

    useEffect(() => {
        if (!isLoading && (isError || !user)) {
            router.replace("/login");
        }
    }, [isLoading, isError, user, router]);

    if (isLoading) {
        return (
            <main
                className="flex min-h-screen items-center justify-center px-4"
                aria-busy="true"
                aria-label="Checking authentication"
            >
                <div className="flex w-full max-w-sm flex-col items-center gap-3">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="mt-4 h-24 w-full" />
                </div>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
