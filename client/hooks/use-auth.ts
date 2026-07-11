"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";


import {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser,
} from "@/services/auth.service";

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ["current-user"],
        queryFn: getCurrentUser,
        retry: false,
    });
};

export const useLogin = () => {
    const queryClient =
        useQueryClient();
    return useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            queryClient.setQueryData(
                ["current-user"],
                data.user
            );
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: registerUser,
    });
};




export const useLogout = () => {
    const queryClient =
        useQueryClient();
    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.clear();
        },
    });
};
