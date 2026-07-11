"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";


type PasswordInputProps =
    React.InputHTMLAttributes<HTMLInputElement>;



export default function PasswordInput(
    {
        className,
        ...props
    }: PasswordInputProps
) {

    const [showPassword,setShowPassword] =
        React.useState(false);


    return (

        <div className="relative">

            <Input

                type={
                    showPassword
                    ?
                    "text"
                    :
                    "password"
                }

                className={className}

                {...props}

            />


            <button

                type="button"

                onClick={() =>
                    setShowPassword(
                        !showPassword
                    )
                }

                className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                "

                aria-label={
                    showPassword
                    ?
                    "Hide password"
                    :
                    "Show password"
                }

            >

                {
                    showPassword
                    ?
                    <EyeOff size={18}/>
                    :
                    <Eye size={18}/>
                }


            </button>


        </div>

    );

}
