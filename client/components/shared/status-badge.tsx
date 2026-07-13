import { cva, type VariantProps } from "class-variance-authority";

import type { ApplicationStatus } from "@/types/interview-process";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva("", {
    variants: {
        status: {
            Applied: "border-transparent bg-secondary text-secondary-foreground",
            Screening:
                "border-transparent bg-[color-mix(in_oklch,var(--chart-1)_18%,transparent)] text-foreground",
            Interviewing:
                "border-transparent bg-[color-mix(in_oklch,var(--chart-2)_20%,transparent)] text-foreground",
            Offer: "border-transparent bg-[color-mix(in_oklch,var(--chart-3)_22%,transparent)] text-foreground",
            Rejected:
                "border-transparent bg-destructive/10 text-destructive",
            Withdrawn: "border-border bg-background text-muted-foreground",
        },
    },
});

interface StatusBadgeProps
    extends VariantProps<typeof statusBadgeVariants> {
    status: ApplicationStatus;
    className?: string;
}

/**
 * Color-coded application status badge.
 */
export default function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(statusBadgeVariants({ status }), className)}
        >
            {status}
        </Badge>
    );
}
