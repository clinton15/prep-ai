import type { AxiosError } from "axios";

export type ApiError = AxiosError<{
    message?: string;
    success?: boolean;
    code?: string;
}>;
