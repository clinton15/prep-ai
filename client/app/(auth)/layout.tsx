/**
 * Authentication Layout
 *
 * This layout is shared between:
 * - Login
 * - Register
 *
 * Responsibilities:
 * - Centers authentication pages
 * - Provides responsive spacing
 * - Uses semantic HTML for accessibility
 */

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-muted/30
                px-4
                py-10
            "
        >
            {children}
        </main>
    );
}