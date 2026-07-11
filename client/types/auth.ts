import { User } from "./user";


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