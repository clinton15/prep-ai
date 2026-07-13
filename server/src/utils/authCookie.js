/*
    Shared cookie options for the JWT auth cookie.

    Local (http://localhost): sameSite=lax, secure=false
    Production (Vercel ↔ Render cross-site): sameSite=none, secure=true
*/
const isProd = process.env.NODE_ENV === 'production';

const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

module.exports = {
    getAuthCookieOptions,
};
