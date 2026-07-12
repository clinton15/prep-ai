"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import AppLayout from "@/components/layout/app-layout";
import { useCurrentUser } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const { data: user } = useCurrentUser();

    return (
        <ProtectedRoute>
            <AppLayout title="Dashboard">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome, {user?.name}
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Let&apos;s prepare for your next interview.
                    </p>
                </header>

                <section
                    className="grid gap-6 md:grid-cols-3"
                    aria-label="Overview"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Experience</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-3xl font-bold">
                                {user?.experience ?? 0} years
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Processes</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Questions Practiced</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-10 flex flex-wrap gap-4">
                    <Button type="button">Create Interview</Button>

                    <Button type="button" variant="outline">
                        View Interviews
                    </Button>
                </section>
            </AppLayout>
        </ProtectedRoute>
    );
}
