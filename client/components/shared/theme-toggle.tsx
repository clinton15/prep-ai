"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/**
 * Cycles between light and dark themes.
 * Icon reflects the action (show moon in light → switch to dark).
 */
export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Toggle theme"
                disabled
            />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <Sun /> : <Moon />}
        </Button>
    );
}
