import AuthCard from "@/components/auth/auth-card";
import RegisterForm from "@/components/auth/register-form";
import DemoLoginButton from "@/components/auth/demo-login-button";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <AuthCard
            title="Create your account"
            description="Start preparing for interviews with AI-guided practice."
        >
            <RegisterForm />

            <p className="mt-6 text-center text-[0.8125rem] text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
                >
                    Sign in
                </Link>
                {" · "}
                <DemoLoginButton variant="link" />
            </p>
        </AuthCard>
    );
}
