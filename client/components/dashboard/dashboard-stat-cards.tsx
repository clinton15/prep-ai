"use client";

import {
    Briefcase,
    CheckCircle2,
    CircleHelp,
    ClipboardList,
    Target,
    TrendingUp,
    type LucideIcon,
} from "lucide-react";

import type { DashboardSummary } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardStatCardsProps {
    summary?: DashboardSummary;
    experience?: number;
    isLoading: boolean;
}

const CARD_META: {
    title: string;
    icon: LucideIcon;
    getValue: (summary?: DashboardSummary, experience?: number) => string | number;
    getHint: (summary?: DashboardSummary, experience?: number) => string;
}[] = [
    {
        title: "Applications",
        icon: Briefcase,
        getValue: (s) => s?.applications.total ?? 0,
        getHint: () => "Active interview processes",
    },
    {
        title: "Rounds upcoming",
        icon: ClipboardList,
        getValue: (s) => s?.rounds.pending ?? 0,
        getHint: (s) => `${s?.rounds.completed ?? 0} completed`,
    },
    {
        title: "Questions practiced",
        icon: CircleHelp,
        getValue: (s) => s?.questions.practiced ?? s?.questions.answered ?? 0,
        getHint: (s) => `${s?.questions.generated ?? 0} generated`,
    },
    {
        title: "Completion",
        icon: CheckCircle2,
        getValue: (s) =>
            `${s?.questions.completionPercentage?.toFixed(0) ?? 0}%`,
        getHint: (s) =>
            `${s?.questions.completed ?? 0} of ${s?.questions.generated ?? 0} completed`,
    },
    {
        title: "Avg. score",
        icon: Target,
        getValue: (s) =>
            s?.performance.averageScore != null
                ? s.performance.averageScore.toFixed(1)
                : "0.0",
        getHint: (_s, experience = 0) => `Experience: ${experience} yrs`,
    },
];

/**
 * KPI strip with icons and polished skeletons.
 */
export default function DashboardStatCards({
    summary,
    experience = 0,
    isLoading,
}: DashboardStatCardsProps) {
    if (isLoading) {
        return (
            <div
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                aria-busy="true"
                aria-label="Loading statistics"
            >
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} size="sm" className="animate-fade-in">
                        <CardHeader className="pb-0">
                            <Skeleton className="h-3.5 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <section
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            aria-label="Overview statistics"
        >
            {CARD_META.map((card, index) => {
                const Icon = card.icon;

                return (
                    <Card
                        key={card.title}
                        size="sm"
                        className={cn(
                            "transition-colors duration-200 hover:bg-muted/30 animate-fade-up",
                            `stagger-${(index % 5) + 1}`
                        )}
                    >
                        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <span className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <Icon className="size-3.5" aria-hidden />
                            </span>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-[1.75rem]">
                                {card.getValue(summary, experience)}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                {card.title === "Avg. score" ? (
                                    <TrendingUp
                                        className="size-3 shrink-0 opacity-70"
                                        aria-hidden
                                    />
                                ) : null}
                                {card.getHint(summary, experience)}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
}
