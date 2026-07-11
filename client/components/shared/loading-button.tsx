"use client";

import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingButtonProps
    extends React.ComponentProps<typeof Button> {
    loading?: boolean;
}

export default function LoadingButton({
    loading = false,
    children,
    disabled,
    ...props
}: LoadingButtonProps) {
    return (
        <Button
            disabled={loading || disabled}
            {...props}
        >
            {loading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}

            {children}
        </Button>
    );
}
