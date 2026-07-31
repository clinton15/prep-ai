"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
    loginUser,
    registerUser,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    logoutUser,
} from "@/services/auth.service";

import type {
    AuthResponse,
    ForgotPasswordPayload,
    ForgotPasswordResponse,
    LoginPayload,
    MessageResponse,
    RegisterPayload,
    ResetPasswordPayload,
    User,
} from "@/types/auth";

import type { ApiError } from "@/types/api-error";

/** Shared query key for the authenticated user. */
export const CURRENT_USER_QUERY_KEY = ["current-user"] as const;

export function useLogin() {
    return useMutation<AuthResponse, ApiError, LoginPayload>({
        mutationFn: loginUser,
    });
}

export function useRegister() {
    return useMutation<AuthResponse, ApiError, RegisterPayload>({
        mutationFn: registerUser,
    });
}

export function useForgotPassword() {
    return useMutation<
        ForgotPasswordResponse,
        ApiError,
        ForgotPasswordPayload
    >({
        mutationFn: forgotPassword,
    });
}

export function useResetPassword() {
    return useMutation<
        MessageResponse,
        ApiError,
        ResetPasswordPayload
    >({
        mutationFn: resetPassword,
    });
}

/**
 * Fetches the current user from the httpOnly cookie session.
 * retry: false avoids retrying 401s before ProtectedRoute redirects.
 */
export function useCurrentUser() {
    return useQuery<User, ApiError>({
        queryKey: CURRENT_USER_QUERY_KEY,
        queryFn: getCurrentUser,
        retry: false,
    });
}

/**
 * Clears the auth cookie and removes the cached current-user query.
 */
export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.removeQueries({
                queryKey: CURRENT_USER_QUERY_KEY,
            });
            router.replace("/login");
        },
    });
}
