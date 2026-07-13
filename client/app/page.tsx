import Link from "next/link";
import {
    Brain,
    ChartColumn,
    MessageSquareQuote,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/shared/theme-toggle";

const FEATURES = [
    {
        title: "AI question generation",
        description:
            "Generate role-specific interview questions with Easy, Medium, Hard, or Mixed difficulty.",
        icon: Sparkles,
    },
    {
        title: "AI feedback",
        description:
            "Submit answers and receive technical and communication scores plus missing concepts.",
        icon: Brain,
    },
    {
        title: "Follow-up questions",
        description:
            "Go deeper with interviewer-style follow-ups after each practiced question.",
        icon: MessageSquareQuote,
    },
    {
        title: "Progress tracking",
        description:
            "Dashboard analytics for completion, topics practiced, and weak areas to revise.",
        icon: ChartColumn,
    },
] as const;

/**
 * Public landing — brand-first hero, then features and architecture for recruiters.
 */
export default function Home() {
    return (
        <div className="auth-surface relative min-h-screen overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_70%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_70%,transparent)_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)] opacity-60" />

            <header className="relative z-10 flex items-center justify-end gap-2 px-4 py-4 sm:px-8 sm:py-5">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Sign in</Link>
                </Button>
                <ThemeToggle />
            </header>

            <main id="main-content" tabIndex={-1} className="relative z-10 outline-none">
                <section className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-3xl flex-col justify-center px-4 pb-16 sm:px-6">
                    <div className="animate-fade-up flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                            P
                        </span>
                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                            PrepAI
                        </h1>
                    </div>

                    <p className="animate-fade-up stagger-1 mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        Prepare smarter for your next software engineering
                        interview.
                    </p>

                    <div className="animate-fade-up stagger-2 mt-9 flex flex-wrap gap-3">
                        <Button asChild size="lg">
                            <Link href="/register">Get started</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link href="/login">Sign in</Link>
                        </Button>
                    </div>
                </section>

                <section
                    className="border-t bg-background/60 px-4 py-16 sm:px-6"
                    aria-labelledby="features-heading"
                >
                    <div className="mx-auto max-w-5xl">
                        <h2
                            id="features-heading"
                            className="text-2xl font-semibold tracking-tight"
                        >
                            Built for interview prep
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            From application tracking to AI-evaluated practice
                            sessions — one workflow for software engineering
                            interviews.
                        </p>

                        <ul className="mt-10 grid gap-8 sm:grid-cols-2">
                            {FEATURES.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <li key={feature.title} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                <Icon
                                                    className="size-4"
                                                    aria-hidden
                                                />
                                            </span>
                                            <h3 className="text-sm font-medium">
                                                {feature.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>

                <section
                    className="border-t px-4 py-16 sm:px-6"
                    aria-labelledby="architecture-heading"
                >
                    <div className="mx-auto max-w-5xl">
                        <h2
                            id="architecture-heading"
                            className="text-2xl font-semibold tracking-tight"
                        >
                            Architecture
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Next.js App Router frontend, Express API with JWT
                            httpOnly cookies, MongoDB, and Gemini for generation
                            and evaluation — Controllers → Services → Models.
                        </p>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Full details live in the repo under{" "}
                            <code className="text-foreground">docs/architecture.md</code>
                            .
                        </p>
                    </div>
                </section>

                <section
                    className="border-t bg-background/60 px-4 py-16 sm:px-6"
                    aria-labelledby="demo-heading"
                >
                    <div className="mx-auto max-w-5xl">
                        <h2
                            id="demo-heading"
                            className="text-2xl font-semibold tracking-tight"
                        >
                            Try the product
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Create a free account, or seed a demo user locally
                            for a filled dashboard and practice history.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild size="lg">
                                <Link href="/register">Create account</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/login">Demo login</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <footer className="border-t px-4 py-8 text-center text-xs text-muted-foreground sm:px-6">
                    PrepAI — AI-powered interview preparation
                </footer>
            </main>
        </div>
    );
}
