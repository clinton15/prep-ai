"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useArchiveInterviewProcess } from "@/hooks/use-interview-process";
import type { ApiError } from "@/types/api-error";
import LoadingButton from "@/components/shared/loading-button";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ArchiveInterviewProcessDialogProps {
    processId: string;
    company: string;
    role: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArchived?: () => void;
}

/**
 * Confirms soft-delete (archive) of an interview process.
 */
export default function ArchiveInterviewProcessDialog({
    processId,
    company,
    role,
    open,
    onOpenChange,
    onArchived,
}: ArchiveInterviewProcessDialogProps) {
    const archiveMutation = useArchiveInterviewProcess();

    function handleArchive() {
        archiveMutation.mutate(processId, {
            onSuccess: (data) => {
                toast.success(
                    data.message ?? "Interview process archived"
                );
                onOpenChange(false);
                onArchived?.();
            },
            onError: (error: ApiError) => {
                toast.error(
                    error.response?.data?.message ??
                        "Failed to archive interview process"
                );
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Archive interview process?</DialogTitle>
                    <DialogDescription>
                        This will archive{" "}
                        <span className="font-medium text-foreground">
                            {role}
                        </span>{" "}
                        at{" "}
                        <span className="font-medium text-foreground">
                            {company}
                        </span>
                        . You can no longer edit it from the list.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={archiveMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        type="button"
                        variant="destructive"
                        loading={archiveMutation.isPending}
                        onClick={handleArchive}
                    >
                        Archive
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ArchiveInterviewProcessButtonProps {
    processId: string;
    company: string;
    role: string;
    onArchived?: () => void;
    variant?: React.ComponentProps<typeof Button>["variant"];
    size?: React.ComponentProps<typeof Button>["size"];
    className?: string;
}

/**
 * Button that opens the archive confirmation dialog.
 */
export function ArchiveInterviewProcessButton({
    processId,
    company,
    role,
    onArchived,
    variant = "outline",
    size = "sm",
    className,
}: ArchiveInterviewProcessButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                type="button"
                variant={variant}
                size={size}
                className={className}
                onClick={() => setOpen(true)}
                aria-label={`Archive ${role} at ${company}`}
            >
                Archive
            </Button>

            <ArchiveInterviewProcessDialog
                processId={processId}
                company={company}
                role={role}
                open={open}
                onOpenChange={setOpen}
                onArchived={onArchived}
            />
        </>
    );
}
