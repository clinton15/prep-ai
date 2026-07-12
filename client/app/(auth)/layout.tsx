/**
 * Nested layout for auth pages (login / register).
 *
 * Intentionally has NO html/body/fonts/QueryProvider —
 * those live in the root app/layout.tsx.
 */
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
            <p className="mb-8 text-2xl font-bold tracking-tight">
                PrepAI
            </p>

            {children}
        </div>
    );
}
