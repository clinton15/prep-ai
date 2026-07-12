import api from "./api";

import {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    User,
} from "@/types/auth";


// Register user
export const registerUser = async (
    data: RegisterPayload
): Promise<AuthResponse> => {

    const response =
        await api.post(
            "/auth/register",
            data
        );

    return response.data;
};



// Login user
export const loginUser = async (
    data: LoginPayload
): Promise<AuthResponse> => {

    const response =
        await api.post(
            "/auth/login",
            data
        );

    return response.data;
};



// Get current logged-in user
export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data.user;
};



// Logout user
export const logoutUser = async () => {

    const response =
        await api.post(
            "/auth/logout"
        );

    return response.data;

};
