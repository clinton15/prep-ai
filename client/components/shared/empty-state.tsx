import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
    icon?: LucideIcon;
    className?: string;
}

/**
 * Polished empty state for lists and sections.
 */
export default function EmptyState({
    title,
    description,
    actionHref,
    actionLabel,
    icon: Icon = Inbox,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center animate-fade-up",
                className
            )}
            role="status"
        >
            <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="size-5" aria-hidden />
            </span>
            <p className="text-sm font-medium tracking-tight">{title}</p>
            {description ? (
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            ) : null}
            {actionHref && actionLabel ? (
                <Button asChild className="mt-5" size="sm">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            ) : null}
        </div>
    );
}
