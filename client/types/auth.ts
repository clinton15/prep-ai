export interface User {
    _id: string;
    name: string;
    email: string;
    experience: number;
}


export interface AuthResponse {

    message: string;

    user: User;

}


export interface LoginPayload {

    email: string;

    password: string;

}


export interface RegisterPayload {

    name: string;

    email: string;

    password: string;

    experience?: number;

}


export interface ForgotPasswordPayload {

    email: string;

}


export interface ForgotPasswordResponse {

    message: string;

    /** Present only in non-production API responses */
    resetUrl?: string | null;

    resetToken?: string;

}


export interface ResetPasswordPayload {

    token: string;

    password: string;

}


export interface MessageResponse {

    message: string;

}
