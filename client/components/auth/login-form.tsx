"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { loginSchema } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/use-auth";

import LoadingButton from "@/components/shared/loading-button";
import PasswordInput from "@/components/auth/password-input";

import { Input } from "@/components/ui/input";
import type { ApiError } from "@/types/api-error";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";


type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginForm() {

    const router = useRouter();

    const loginMutation = useLogin();


    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),

        defaultValues: {
            email: "",
            password: "",
        },
    });


    /**
     * Handles login API call
     */
    function onSubmit(values: LoginFormValues) {

        loginMutation.mutate(values, {

            onSuccess: () => {

                toast.success(
                    "Logged in successfully"
                );

                router.replace("/dashboard");

            },


            onError: (error: ApiError) => {

                toast.error(
                    error.response?.data?.message ??
                    "Login failed"
                );
            
            },

        });

    }


    return (

        <Form {...form}>

            <form
                onSubmit={
                    form.handleSubmit(onSubmit)
                }
                className="space-y-5"
                noValidate
            >

                {/* Email */}

                <FormField
                    control={form.control}
                    name="email"

                    render={({ field }) => (

                        <FormItem>

                            <FormLabel>
                                Email
                            </FormLabel>


                            <FormControl>

                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    autoComplete="email"
                                    {...field}
                                />

                            </FormControl>


                            <FormMessage />

                        </FormItem>

                    )}
                />



                {/* Password */}

                <FormField
                    control={form.control}
                    name="password"

                    render={({ field }) => (

                        <FormItem>

                            <FormLabel>
                                Password
                            </FormLabel>


                            <FormControl>

                                <PasswordInput
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    {...field}
                                />

                            </FormControl>


                            <FormMessage />

                        </FormItem>

                    )}
                />



                <LoadingButton

                    type="submit"

                    className="w-full"

                    loading={
                        loginMutation.isPending
                    }

                >
                    Login
                </LoadingButton>


            </form>

        </Form>

    );
}
