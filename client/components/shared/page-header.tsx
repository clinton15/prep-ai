import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}

/**
 * Notion-inspired page header: clear hierarchy, generous spacing.
 */
export default function PageHeader({
    title,
    description,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <header
            className={cn(
                "mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
                className
            )}
        >
            <div className="min-w-0 space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                    {title}
                </h1>
                {description ? (
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                        {description}
                    </p>
                ) : null}
            </div>

            {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            ) : null}
        </header>
    );
}
