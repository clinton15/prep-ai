import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
    return (
        <AuthCard
            title="Sign in to PrepAI"
            description="Welcome back. Enter your credentials to continue."
        >
            <LoginForm />

            <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                >
                    Create one
                </Link>
            </p>
        </AuthCard>
    );
}
