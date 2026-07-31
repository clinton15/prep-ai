# AI prompts

All prompts live in [`server/services/ai.service.js`](../server/services/ai.service.js). Responses request `application/json` from Gemini (`GEMINI_MODEL` + `GEMINI_API_KEY`).

## Question generation — `buildQuestionPrompt`

**Purpose:** Produce N interview questions for a company/role/round with a difficulty preference.

**Inputs:** `company`, `role`, `experience`, `roundTitle`, `roundType`, `numberOfQuestions`, `difficulty` (`Easy` | `Medium` | `Hard` | `Mixed`), optional `jobDescription`, optional `resumeText`.

**Output shape (JSON array):**

```json
[
  {
    "question": "...",
    "expectedAnswer": "...",
    "topic": "React",
    "difficulty": "Medium",
    "order": 1
  }
]
```

**Notes:** For non-`Mixed` difficulty, the controller forces stored difficulty to the requested value. Generation is one-shot per round (409 if questions already exist). When JD/resume text is provided, they are included in the prompt and persisted on the interview process for follow-ups. Resume files are parsed via `POST /api/questions/parse-resume` (PDF/DOCX) — binary is not stored.

## Answer evaluation — `buildEvaluationPrompt`

**Purpose:** Score a candidate answer against the expected answer.

**Inputs:** `question`, `expectedAnswer`, `userAnswer`.

**Output shape:**

```json
{
  "technicalScore": 7,
  "communicationScore": 8,
  "score": 7.5,
  "feedback": "...",
  "strengths": ["..."],
  "improvements": ["..."],
  "missingConcepts": ["..."]
}
```

**Notes:** Controller normalizes scores (0–10), persists an `InterviewAnswer`, and sets question `status` to `Practiced` when it was `Generated`. Re-evaluation creates a new answer document.

## Follow-up questions — `buildFollowUpPrompt`

**Purpose:** Generate three interviewer-style follow-ups for a parent question.

**Inputs:** `question`, `expectedAnswer`, `topic`, `difficulty`, optional `jobDescription`, optional `resumeText` (from the parent interview process when saved).

**Output:** Same array shape as generation (exactly 3 items intended): deeper technical, practical scenario, typical interviewer probe.

**Notes:** Stored with `isFollowUp: true` and `parentQuestion` set. One-shot per parent (409 if follow-ups already exist). Rate limited with other AI routes.
