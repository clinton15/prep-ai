import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import DemoLoginButton from "@/components/auth/demo-login-button";
import Link from "next/link";

export default function LoginPage() {
    return (
        <AuthCard
            title="Sign in to PrepAI"
            description="Welcome back. Enter your credentials to continue."
        >
            <LoginForm />

            {/* TODO: re-enable when forgot/reset-password UI is finished
            <p className="mt-3 text-center text-[0.8125rem] text-muted-foreground">
                <Link
                    href="/forgot-password"
                    className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                >
                    Forgot password?
                </Link>
            </p>
            */}

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        Or
                    </span>
                </div>
            </div>

            <DemoLoginButton />

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
