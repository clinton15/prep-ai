import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <AuthCard
            title="Welcome Back"
            description="Sign in to continue your interview preparation."
        >
            <LoginForm />
        </AuthCard>
    );
}
