import AuthCard from "@/components/auth/auth-card";
import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
    return (
        <AuthCard
            title="Create Account"
            description="Start preparing for interviews with AI."
        >
            <RegisterForm />
        </AuthCard>
    );
}
