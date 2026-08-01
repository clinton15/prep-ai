import AuthCard from "@/components/auth/auth-card";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import Link from "next/link";

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    const params = await searchParams;
    const token = params.token?.trim() ?? "";

    return (
        <AuthCard
            title="Reset your password"
            description={
                token
                    ? "Choose a new password for your account."
                    : "This reset link is missing a token. Request a new one from the forgot-password page."
            }
        >
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

            <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
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
