"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import AppSidebar from "@/components/layout/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AppLayoutProps {
    children: React.ReactNode;
    /** Optional page title shown in the top bar. */
    title?: string;
}

/**
 * Authenticated app shell with collapsible sidebar (Linear-inspired).
 */
export default function AppLayout({ children, title }: AppLayoutProps) {
    return (
        <TooltipProvider delayDuration={200}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="app-surface min-h-svh">
                    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md supports-backdrop-filter:bg-background/70 sm:px-4">
                        <SidebarTrigger className="-ml-0.5" />
                        {title ? (
                            <>
                                <Separator
                                    orientation="vertical"
                                    className="mr-1 hidden h-4 sm:block"
                                />
                                <p className="hidden truncate text-sm font-medium text-muted-foreground sm:block">
                                    {title}
                                </p>
                            </>
                        ) : null}
                    </header>

                    <main
                        id="main-content"
                        tabIndex={-1}
                        className="mx-auto w-full max-w-6xl flex-1 scroll-mt-14 px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8"
                    >
                        <div className="animate-fade-up">{children}</div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}
