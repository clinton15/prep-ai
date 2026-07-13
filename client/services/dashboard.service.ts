import api from "./api";

import type { DashboardResponse } from "@/types/dashboard";

export const getDashboard = async (): Promise<DashboardResponse> => {
    const response = await api.get("/dashboard");
    return response.data;
};
