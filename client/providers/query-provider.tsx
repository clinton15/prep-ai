"use client";

import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

import { useState } from "react";


export default function QueryProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,

                        // Data remains fresh for 5 minutes
                        staleTime:
                            1000 * 60 * 5,

                        // Refetch when window is focused
                        refetchOnWindowFocus:
                            false,
                    },
                },
            })
    );


    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
