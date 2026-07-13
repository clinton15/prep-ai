import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

/**
 * Clerk-inspired authentication card — clean, centered, quiet chrome.
 */
export default function AuthCard({
    title,
    description,
    children,
}: AuthCardProps) {
    return (
        <Card className="w-full border-border/80 shadow-sm ring-1 ring-foreground/5">
            <CardHeader className="space-y-1.5 px-6 pt-6 pb-2 text-center sm:px-8">
                <CardTitle className="text-xl font-semibold tracking-tight">
                    {title}
                </CardTitle>
                <CardDescription className="text-[0.8125rem] leading-relaxed">
                    {description}
                </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
                {children}
            </CardContent>
        </Card>
    );
}
