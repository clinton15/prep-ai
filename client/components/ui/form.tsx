"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import {
    Controller,
    FormProvider,
    useFormContext,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";


import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";



/* -------------------------------------------------------------------------- */
/*                                  Contexts                                  */
/* -------------------------------------------------------------------------- */


const Form = FormProvider;



type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
};



const FormFieldContext =
    React.createContext<FormFieldContextValue>(
        {} as FormFieldContextValue
    );



const FormItemContext =
    React.createContext<{
        id:string;
    }>({
        id:"",
    });




/* -------------------------------------------------------------------------- */
/*                               Form Field                                   */
/* -------------------------------------------------------------------------- */


function FormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>
>(
    props: ControllerProps<TFieldValues,TName>
) {

    return (

        <FormFieldContext.Provider
            value={{
                name:props.name,
            }}
        >

            <Controller
                {...props}
            />

        </FormFieldContext.Provider>

    );

}




/* -------------------------------------------------------------------------- */
/*                              useFormField                                  */
/* -------------------------------------------------------------------------- */


function useFormField(){

    const fieldContext =
        React.useContext(FormFieldContext);


    const itemContext =
        React.useContext(FormItemContext);



    const {
        getFieldState,
        formState,
    } =
        useFormContext();



    const fieldState =
        getFieldState(
            fieldContext.name,
            formState
        );



    if(!fieldContext){

        throw new Error(
            "useFormField must be used inside FormField"
        );

    }



    return {

        name:fieldContext.name,

        id:itemContext.id,


        formItemId:
            `${itemContext.id}-form-item`,


        formDescriptionId:
            `${itemContext.id}-form-description`,


        formMessageId:
            `${itemContext.id}-form-message`,


        ...fieldState,

    };

}





/* -------------------------------------------------------------------------- */
/*                                Form Item                                   */
/* -------------------------------------------------------------------------- */


function FormItem({
    className,
    ...props
}:React.HTMLAttributes<HTMLDivElement>) {


    const id =
        React.useId();



    return (

        <FormItemContext.Provider
            value={{
                id,
            }}
        >

            <div

                className={
                    cn(
                        "space-y-2",
                        className
                    )
                }

                {...props}

            />

        </FormItemContext.Provider>

    );

}





/* -------------------------------------------------------------------------- */
/*                               Form Label                                   */
/* -------------------------------------------------------------------------- */


function FormLabel({
    className,
    ...props
}:React.ComponentProps<typeof Label>) {


    const {
        error,
        formItemId,
    } =
        useFormField();



    return (

        <Label

            htmlFor={formItemId}

            className={
                cn(
                    error &&
                    "text-destructive",
                    className
                )
            }

            {...props}

        />

    );

}




/* -------------------------------------------------------------------------- */
/*                              Form Control                                  */
/* -------------------------------------------------------------------------- */


const FormControl =
React.forwardRef<
    React.ElementRef<typeof Slot>,
    React.ComponentPropsWithoutRef<typeof Slot>
>(
function FormControl(
    {
        ...props
    },
    ref
){

    const {
        error,
        formItemId,
        formDescriptionId,
        formMessageId,
    } =
        useFormField();



    return (

        <Slot

            ref={ref}

            id={formItemId}

            aria-describedby={
                error
                ?
                `${formDescriptionId} ${formMessageId}`
                :
                formDescriptionId
            }

            aria-invalid={
                !!error
            }

            {...props}

        />

    );

});



FormControl.displayName =
"FormControl";





/* -------------------------------------------------------------------------- */
/*                            Form Description                                */
/* -------------------------------------------------------------------------- */


function FormDescription({

    className,
    ...props

}:React.HTMLAttributes<HTMLParagraphElement>) {


    const {
        formDescriptionId
    } =
        useFormField();



    return (

        <p

            id={formDescriptionId}

            className={
                cn(
                    "text-sm text-muted-foreground",
                    className
                )
            }

            {...props}

        />

    );

}





/* -------------------------------------------------------------------------- */
/*                              Form Message                                  */
/* -------------------------------------------------------------------------- */


function FormMessage({

    className,

    children,

    ...props

}:React.HTMLAttributes<HTMLParagraphElement>) {


    const {
        error,
        formMessageId
    }
    =
    useFormField();



    const body =
        error?.message ??
        children;



    if(!body){

        return null;

    }



    return (

        <p

            id={formMessageId}

            className={
                cn(
                    "text-sm font-medium text-destructive",
                    className
                )
            }

            {...props}

        >

            {String(body)}

        </p>

    );

}




export {

    Form,

    FormField,

    FormItem,

    FormLabel,

    FormControl,

    FormDescription,

    FormMessage,

};
