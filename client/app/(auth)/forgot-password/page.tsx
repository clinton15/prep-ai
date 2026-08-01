import AuthCard from "@/components/auth/auth-card";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Forgot your password?"
            description="Enter your account email. We'll create a reset link and take you there (no email required for personal use)."
        >
            <ForgotPasswordForm />

            <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
                Remembered it?{" "}
                <Link
                    href="/login"
                    className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                >
                    Back to sign in
                </Link>
            </p>
        </AuthCard>
    );
}
