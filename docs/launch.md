# Launch & production checklists

## Production readiness checklist

- [ ] API and client env vars set for production (see root README)
- [ ] MongoDB Atlas (or managed) with network access limited to API hosts
- [ ] `NODE_ENV=production` so cookies use `Secure` and stacks are hidden
- [ ] `CLIENT_URL` matches the deployed frontend origin (CORS + cookies)
- [ ] `trust proxy` enabled in production (already gated in `server.js`)
- [ ] Gemini key present; model id verified
- [ ] Auth + AI rate limits verified under reverse proxy
- [ ] Indexes created (Mongoose syncs on model load; confirm in Atlas)
- [ ] Soft-archive ownership blocks AI on archived process/round
- [ ] Error responses use `{ success, message, code }`
- [ ] Frontend builds (`cd client && npm run build`)
- [ ] Demo seed run only against non-prod or disposable DB if needed

## Security checklist

- [ ] JWT only in httpOnly cookie (no localStorage tokens)
- [ ] Helmet enabled
- [ ] CORS locked to `CLIENT_URL` with credentials
- [ ] Passwords bcrypt-hashed
- [ ] Auth endpoints rate-limited
- [ ] AI endpoints rate-limited
- [ ] Request body size limited (`express.json` 1mb)
- [ ] No stack traces in production error JSON
- [ ] Gemini/API errors not dumping secrets to logs in production
- [ ] Ownership checks on process → round → question → answer

## Performance checklist

- [ ] Process / round / question / answer indexes present
- [ ] Round detail uses a single questions fetch (client-side filter)
- [ ] Dashboard aggregates acceptable for expected data volume
- [ ] Charts not blocking critical path beyond dashboard route
- [ ] Avoid N+1 where possible (practice still loads prior answer per question — acceptable for v1.2)

## Launch checklist

- [ ] Deploy API (Render/Railway/Fly/etc.)
- [ ] Deploy client (Vercel)
- [ ] Smoke test: register → process → round → generate → practice → evaluate → dashboard
- [ ] Smoke test: practice session → summary
- [ ] Smoke test: light/dark theme
- [ ] README + docs linked for recruiters
- [ ] Optional: `npm run seed:demo` on a staging DB; share demo credentials privately

### Vercel (frontend)

- `NEXT_PUBLIC_API_URL` = `https://your-api.example.com/api`

### API host (backend)

- `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `NODE_ENV=production`

## Recommended next-version features (v1.3+)

- Persist practice sessions server-side
- Unique latest-answer upsert + answer history UI
- OAuth / magic link auth
- Email verification and password reset
- Stronger password policy on register
- Dynamic import for Recharts to shrink dashboard bundle
- Billing / plans if productized
- Export practice summary PDF
- Collaborative coach review mode
