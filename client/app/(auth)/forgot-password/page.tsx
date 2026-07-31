import AuthCard from "@/components/auth/auth-card";
// import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import Link from "next/link";

/** Forgot-password UI temporarily disabled — backend exists; re-enable when ready. */
export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Forgot your password?"
            description="Password reset is not available in the UI yet."
        >
            {/* TODO: re-enable when forgot-password UI is finished
            <ForgotPasswordForm />
            */}

            <p className="text-center text-sm text-muted-foreground">
                This flow is temporarily hidden.{" "}
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
