/*
    Shared cookie options for the JWT auth cookie.

    Development: secure=false so cookies work over http://localhost
    Production:  set NODE_ENV=production to enable secure cookies (HTTPS)
*/
const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

module.exports = {
    getAuthCookieOptions,
};
