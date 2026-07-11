"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";


import { registerSchema } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/use-auth";


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



type RegisterFormInput =
    z.input<typeof registerSchema>;


type RegisterFormOutput =
    z.output<typeof registerSchema>;



export default function RegisterForm() {


    const router = useRouter();


    const registerMutation =
        useRegister();



    const form = useForm<
        RegisterFormInput,
        unknown,
        RegisterFormOutput
    >({
        resolver: zodResolver(registerSchema),

        defaultValues: {
            name: "",
            email: "",
            password: "",
            experience: undefined,
        },
    });



    /**
     * Handles registration API call
     */
    function onSubmit(
        values: RegisterFormOutput
    ) {


        registerMutation.mutate(values, {


            onSuccess: () => {


                toast.success(
                    "Registration successful"
                );


                router.replace("/login");


            },


            onError: (error: ApiError) => {

                toast.error(
                    error.response?.data?.message ??
                    "Registration failed"
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


                {/* Name */}

                <FormField

                    control={form.control}

                    name="name"


                    render={({ field }) => (


                        <FormItem>


                            <FormLabel>
                                Full Name
                            </FormLabel>


                            <FormControl>


                                <Input

                                    placeholder="John Doe"

                                    autoComplete="name"

                                    {...field}

                                />


                            </FormControl>


                            <FormMessage />


                        </FormItem>


                    )}

                />



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

                                    placeholder="••••••••"

                                    autoComplete="new-password"

                                    {...field}

                                />


                            </FormControl>


                            <FormMessage />


                        </FormItem>


                    )}

                />



                {/* Experience */}

                <FormField

                    control={form.control}

                    name="experience"


                    render={({ field }) => (

                        <FormItem>

                            <FormLabel>
                                Experience (Years)
                            </FormLabel>


                            <FormControl>

                                <Input

                                    type="number"

                                    min={0}

                                    max={40}

                                    placeholder="3"

                                    value={
                                        typeof field.value === "number"
                                            ? field.value
                                            : ""
                                    }

                                    onChange={(e) => {

                                        const value =
                                            e.target.value;


                                        field.onChange(
                                            value === ""
                                                ? undefined
                                                : Number(value)
                                        );

                                    }}

                                    onBlur={field.onBlur}

                                    name={field.name}

                                    ref={field.ref}

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
                        registerMutation.isPending
                    }


                >

                    Create Account


                </LoadingButton>


            </form>


        </Form>

    );

}
