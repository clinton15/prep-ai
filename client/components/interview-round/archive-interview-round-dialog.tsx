"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useArchiveInterviewRound } from "@/hooks/use-interview-round";
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

interface ArchiveInterviewRoundDialogProps {
    roundId: string;
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onArchived?: () => void;
}

export default function ArchiveInterviewRoundDialog({
    roundId,
    title,
    open,
    onOpenChange,
    onArchived,
}: ArchiveInterviewRoundDialogProps) {
    const archiveMutation = useArchiveInterviewRound();

    function handleArchive() {
        archiveMutation.mutate(roundId, {
            onSuccess: (data) => {
                toast.success(data.message ?? "Interview round archived");
                onOpenChange(false);
                onArchived?.();
            },
            onError: (error: ApiError) => {
                toast.error(
                    error.response?.data?.message ??
                        "Failed to archive interview round"
                );
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Archive interview round?</DialogTitle>
                    <DialogDescription>
                        This will archive{" "}
                        <span className="font-medium text-foreground">
                            {title}
                        </span>
                        . It will no longer appear in this process.
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

interface ArchiveInterviewRoundButtonProps {
    roundId: string;
    title: string;
    onArchived?: () => void;
    variant?: React.ComponentProps<typeof Button>["variant"];
    size?: React.ComponentProps<typeof Button>["size"];
    className?: string;
}

export function ArchiveInterviewRoundButton({
    roundId,
    title,
    onArchived,
    variant = "outline",
    size = "sm",
    className,
}: ArchiveInterviewRoundButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                type="button"
                variant={variant}
                size={size}
                className={className}
                onClick={() => setOpen(true)}
                aria-label={`Archive round ${title}`}
            >
                Archive
            </Button>

            <ArchiveInterviewRoundDialog
                roundId={roundId}
                title={title}
                open={open}
                onOpenChange={setOpen}
                onArchived={onArchived}
            />
        </>
    );
}
