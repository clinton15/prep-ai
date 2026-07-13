"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";

import {
    APPLICATION_STATUSES,
    type ApplicationStatus,
} from "@/types/interview-process";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface InterviewProcessFiltersState {
    company: string;
    role: string;
    status: ApplicationStatus | "";
}

interface InterviewProcessFiltersProps {
    values: InterviewProcessFiltersState;
}

/**
 * Filter controls synced to URL search params for shareable list state.
 */
export default function InterviewProcessFilters({
    values,
}: InterviewProcessFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateParams = useCallback(
        (next: Partial<InterviewProcessFiltersState>) => {
            const params = new URLSearchParams(searchParams.toString());

            const merged: InterviewProcessFiltersState = {
                company: next.company ?? values.company,
                role: next.role ?? values.role,
                status: next.status ?? values.status,
            };

            if (merged.company) {
                params.set("company", merged.company);
            } else {
                params.delete("company");
            }

            if (merged.role) {
                params.set("role", merged.role);
            } else {
                params.delete("role");
            }

            if (merged.status) {
                params.set("status", merged.status);
            } else {
                params.delete("status");
            }

            params.delete("page");

            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname);
        },
        [pathname, router, searchParams, values]
    );

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        updateParams({
            company: String(formData.get("company") ?? "").trim(),
            role: String(formData.get("role") ?? "").trim(),
            status: String(
                formData.get("status") ?? ""
            ) as ApplicationStatus | "",
        });
    }

    function handleClear() {
        router.replace(pathname);
    }

    const hasFilters = Boolean(
        values.company || values.role || values.status
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-xl border bg-card/60 p-4 shadow-xs"
            aria-label="Filter interview processes"
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                    <Label
                        htmlFor="filter-company"
                        className="text-xs text-muted-foreground"
                    >
                        Company
                    </Label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="filter-company"
                            name="company"
                            defaultValue={values.company}
                            placeholder="Search company"
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="filter-role"
                        className="text-xs text-muted-foreground"
                    >
                        Role
                    </Label>
                    <Input
                        id="filter-role"
                        name="role"
                        defaultValue={values.role}
                        placeholder="Search role"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="filter-status"
                        className="text-xs text-muted-foreground"
                    >
                        Status
                    </Label>
                    <Select
                        id="filter-status"
                        name="status"
                        defaultValue={values.status}
                    >
                        <option value="">All statuses</option>
                        {APPLICATION_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="flex items-end gap-2">
                    <Button type="submit" size="sm" className="flex-1">
                        Apply filters
                    </Button>
                    {hasFilters ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            aria-label="Clear filters"
                        >
                            <X className="size-3.5" />
                            Clear
                        </Button>
                    ) : null}
                </div>
            </div>
        </form>
    );
}
