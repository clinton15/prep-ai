# API Reference

Base URL: `{API_HOST}/api` (example: `http://localhost:8080/api`)

Authentication: JWT in httpOnly cookie `token`. Send requests with credentials (`withCredentials: true`).

## Error envelope

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR"
}
```

| Code | Typical status |
|------|----------------|
| `VALIDATION_ERROR` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `RATE_LIMITED` | 429 |
| `INTERNAL_ERROR` | 500 |

Stack traces are only included when `NODE_ENV=development`.

---

## Auth

### POST `/auth/register`

Rate limited (auth limiter).

**Body**

```json
{ "name": "Ada", "email": "ada@example.com", "password": "...", "experience": 3 }
```

**Response** `201` — sets cookie; returns user payload (see controller).

### POST `/auth/login`

Rate limited (auth limiter).

**Body**

```json
{ "email": "ada@example.com", "password": "..." }
```

### POST `/auth/logout`

Clears auth cookie.

### GET `/auth/me`

Requires auth. Returns current user.

---

## Interview processes

All routes require auth.

| Method | Path | Notes |
|--------|------|-------|
| POST | `/processes` | Create |
| GET | `/processes` | Query: `company`, `role`, `status`, `page`, `limit` |
| GET | `/processes/:id` | Params validated ObjectId |
| PUT | `/processes/:id` | Update |
| DELETE | `/processes/:id` | Soft archive |

---

## Interview rounds

| Method | Path | Notes |
|--------|------|-------|
| POST | `/rounds` | Body includes `interviewProcess` |
| GET | `/rounds` | Optional query `processId` |
| GET | `/rounds/:id` | |
| PUT | `/rounds/:id` | |
| DELETE | `/rounds/:id` | Soft archive |

---

## Questions

AI routes are rate limited (10/min/IP).

### POST `/questions/generate`

```json
{
  "interviewRoundId": "...",
  "numberOfQuestions": 10,
  "difficulty": "Mixed"
}
```

`difficulty`: `Easy` | `Medium` | `Hard` | `Mixed`

**409** if questions already exist for the round.

### GET `/questions/:roundId`

Query: `topic`, `difficulty`, `status`, `bookmarked`, `search`, `sort`, `order`, `includeFollowUps`

### PATCH `/questions/:id`

```json
{ "isBookmarked": true, "notes": "...", "status": "Completed" }
```

### POST `/questions/:id/follow-ups`

Generates 3 follow-up questions. **409** if follow-ups already exist.

### GET `/questions/item/:id`

Single question by id.

---

## Answers

### POST `/answers/evaluate`

Rate limited.

```json
{ "questionId": "...", "answer": "..." }
```

**Response** includes `score`, `technicalScore`, `communicationScore`, `feedback`, `strengths`, `improvements`, `missingConcepts`. Advances question status to `Practiced` when previously `Generated`. Multiple evaluations per question are allowed (history).

### GET `/answers/question/:questionId`

Latest answer for the question (current user).

---

## Dashboard

### GET `/dashboard`

Requires auth.

**Summary fields include:** applications, rounds, questions (generated/practiced/completed/completionPercentage), performance.averageScore, `topTopics`, `weakTopics`, plus `recentActivity`.
