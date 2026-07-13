"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "@/services/dashboard.service";

import type { ApiError } from "@/types/api-error";
import type { DashboardResponse } from "@/types/dashboard";

export const dashboardKeys = {
    all: ["dashboard"] as const,
    summary: () => [...dashboardKeys.all, "summary"] as const,
};

export function useDashboard() {
    return useQuery<DashboardResponse, ApiError>({
        queryKey: dashboardKeys.summary(),
        queryFn: getDashboard,
    });
}
