import {
    useMutation,
} from "@tanstack/react-query";


import {
    loginUser,
    registerUser,
} from "@/services/auth.service";


import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
} from "@/types/auth";


import type {
    ApiError,
} from "@/types/api-error";



export function useLogin(){

    return useMutation<
        AuthResponse,
        ApiError,
        LoginPayload
    >({

        mutationFn: loginUser,

    });

}



export function useRegister(){

    return useMutation<
        AuthResponse,
        ApiError,
        RegisterPayload
    >({

        mutationFn: registerUser,

    });

}
