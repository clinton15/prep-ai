import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AuthCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

/**
 * Reusable authentication card.
 *
 * Used by:
 * - Login
 * - Register
 */
export default function AuthCard({
    title,
    description,
    children,
}: AuthCardProps) {
    return (
        <Card
            className="
                w-full
                max-w-md
                shadow-lg
            "
        >
            <CardHeader className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                    {title}
                </h1>

                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            </CardHeader>

            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}
