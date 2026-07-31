import AuthCard from "@/components/auth/auth-card";
// import ResetPasswordForm from "@/components/auth/reset-password-form";
import Link from "next/link";

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

/** Reset-password UI temporarily disabled — backend exists; re-enable when ready. */
export default async function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    // Keep reading searchParams so the route contract stays valid
    await searchParams;

    return (
        <AuthCard
            title="Reset your password"
            description="Password reset is not available in the UI yet."
        >
            {/* TODO: re-enable when reset-password UI is finished
            {token ? (
                <ResetPasswordForm token={token} />
            ) : (
                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/forgot-password"
                        className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                    >
                        Request a new reset link
                    </Link>
                </p>
            )}
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
