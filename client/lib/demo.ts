/**
 * Public demo account (seeded via `npm run seed:demo`).
 * Override with NEXT_PUBLIC_DEMO_* if needed.
 */
export const DEMO_CREDENTIALS = {
    email:
        process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "testuser@yopmail.com",
    password:
        process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "DemoPass123!",
} as const;
