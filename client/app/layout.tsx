import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import Toaster from "@/components/shared/toaster";
import SkipToContent from "@/components/shared/skip-to-content";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "PrepAI",
        template: "%s · PrepAI",
    },
    description: "AI-powered interview preparation platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col">
                <ThemeProvider>
                    <QueryProvider>
                        <SkipToContent />
                        {children}
                        <Toaster />
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
