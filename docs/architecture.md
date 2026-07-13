# PrepAI Architecture

Technical reference for the PrepAI v1.1 codebase.

## Folder structure

```
client/
  app/                 # Next.js App Router pages
  components/          # UI by domain (auth, interview-*, dashboard, layout, shared, ui)
  hooks/               # TanStack Query hooks
  services/            # Axios API clients
  types/               # Shared TypeScript types
  lib/validations/     # Client Zod schemas
  providers/           # QueryProvider, ThemeProvider

server/
  src/
    controllers/       # HTTP handlers
    models/            # Mongoose schemas
    routes/            # Express routers
    validations/       # Server Zod schemas
    middleware/        # auth, validate, rateLimit, error
    utils/             # helpers (cookies, tokens, ownership)
  services/
    ai.service.js      # Gemini prompts + generate / evaluate / follow-ups
```

## Authentication flow

```mermaid
sequenceDiagram
  participant Browser
  participant Next as Next.js
  participant API as Express
  participant DB as MongoDB

  Browser->>Next: Register / Login form
  Next->>API: POST /api/auth/register|login
  API->>DB: Create/verify User
  API-->>Browser: Set-Cookie token (httpOnly)
  Browser->>Next: Navigate to /dashboard
  Next->>API: GET /api/auth/me (cookie)
  API-->>Next: User profile
  Next-->>Browser: Protected UI
```

- JWT is signed with `JWT_SECRET`, stored in cookie `token` (`httpOnly`, `sameSite=lax`, `secure` in production).
- Frontend uses Axios `withCredentials: true`.
- `ProtectedRoute` gates authenticated pages via `useCurrentUser` → `GET /auth/me`.
- No localStorage tokens, no Redux/Zustand auth store.

## API architecture

Base path: `/api`

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | Clears cookie |
| GET | `/auth/me` | Auth required |
| CRUD | `/processes` | Soft-delete via archive |
| CRUD | `/rounds` | Soft-delete via archive |
| POST | `/questions/generate` | AI, rate-limited |
| GET | `/questions/:roundId` | Query: topic, difficulty, status, bookmarked, search, sort, order |
| PATCH | `/questions/:id` | Bookmark, notes, status |
| POST | `/questions/:id/follow-ups` | AI, rate-limited |
| POST | `/answers/evaluate` | AI, rate-limited |
| GET | `/answers/question/:questionId` | Latest answer for question |
| GET | `/dashboard` | Aggregated analytics |

Request pipeline: `helmet` → `cors` → `json` → `cookieParser` → routes (`auth` → optional `rateLimit` → `validate` → controller) → `errorMiddleware`.

## Database schema

```mermaid
erDiagram
  User ||--o{ InterviewProcess : owns
  InterviewProcess ||--o{ InterviewRound : has
  InterviewRound ||--o{ InterviewQuestion : has
  InterviewQuestion ||--o{ InterviewAnswer : answered_by
  InterviewQuestion ||--o{ InterviewQuestion : follow_ups

  User {
    string name
    string email
    string password
    number experience
  }

  InterviewProcess {
    string company
    string role
    string applicationStatus
    boolean isArchived
  }

  InterviewRound {
    string title
    string roundType
    string status
    boolean isArchived
  }

  InterviewQuestion {
    string question
    string expectedAnswer
    string topic
    string difficulty
    string status
    boolean isBookmarked
    string notes
    ObjectId parentQuestion
    boolean isFollowUp
  }

  InterviewAnswer {
    string answer
    number score
    number technicalScore
    number communicationScore
    string feedback
    array strengths
    array improvements
    array missingConcepts
  }
```

### Question status lifecycle

```
Generated → Practiced (on successful evaluate) → Completed (user marks done)
```

Follow-ups are stored as `InterviewQuestion` rows with `isFollowUp: true` and `parentQuestion` set.

## AI integration flow

```mermaid
flowchart TD
  GenUI[Generate panel] -->|difficulty + count| GenAPI[POST /questions/generate]
  GenAPI --> PromptQ[buildQuestionPrompt]
  PromptQ --> Gemini
  Gemini --> StoreQ[(InterviewQuestion insertMany)]

  Practice[Practice card] -->|user answer| EvalAPI[POST /answers/evaluate]
  EvalAPI --> PromptE[buildEvaluationPrompt]
  PromptE --> Gemini
  Gemini --> StoreA[(InterviewAnswer create)]
  StoreA --> Status[status = Practiced]

  FollowBtn[Generate follow-ups] --> FollowAPI[POST /questions/:id/follow-ups]
  FollowAPI --> PromptF[buildFollowUpPrompt]
  PromptF --> Gemini
  Gemini --> StoreF[(Follow-up questions)]
```

- Model and key come from `GEMINI_MODEL` / `GEMINI_API_KEY`.
- Responses request `application/json` MIME type.
- AI routes are rate-limited (10 requests / minute / IP).

## Frontend data layer decisions

| Concern | Choice | Why |
|---------|--------|-----|
| Server state | TanStack Query | Cache, invalidation, loading/error without global stores |
| Forms | RHF + Zod | Aligns with server Zod validation |
| HTTP | Axios services | Central `withCredentials`, typed payloads |
| UI | shadcn/ui + Tailwind | Consistent design system, dark mode tokens |
| Theme | next-themes | Class-based `.dark` matching CSS variables |

## Security notes

- Passwords hashed with bcrypt.
- Ownership checks walk `User → Process → Round → Question`.
- Soft deletes (`isArchived`) preserve history.
- Helmet sets secure headers; CORS is origin-locked to `CLIENT_URL`.
