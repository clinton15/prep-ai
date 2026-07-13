const { GoogleGenAI } = require('@google/genai');

let ai;

const getAI = () => {
    if (!ai) {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        ai = new GoogleGenAI({ apiKey });
    }

    return ai;
};

function buildDifficultyInstruction(difficulty = 'Mixed') {
    if (difficulty === 'Mixed') {
        return `- Use a balanced mix of Easy, Medium, and Hard questions.
- Assign each question a realistic difficulty of Easy, Medium, or Hard.`;
    }

    return `- ALL questions MUST have difficulty set to "${difficulty}".
- Match the depth and complexity to ${difficulty} level interview questions.`;
}

function buildQuestionPrompt({
    company,
    role,
    experience,
    roundTitle,
    roundType,
    numberOfQuestions = 10,
    difficulty = 'Mixed',
}) {
    return `
You are an experienced Senior Software Engineering Interviewer.

Generate exactly ${numberOfQuestions} interview questions for the following candidate.

Candidate Details

Company: ${company}

Role: ${role}

Experience: ${experience} years

Interview Round: ${roundTitle}

Round Type: ${roundType}

Difficulty preference: ${difficulty}

Instructions:

- The questions should match the candidate's experience level.
- The questions should be relevant to the role and interview round.
- Include a balanced mix of:
  - Theory questions
  - Coding questions
  - Scenario-based questions
  - Best practice questions
${buildDifficultyInstruction(difficulty)}
- Return ONLY valid JSON.
- Do NOT include markdown.
- Do NOT wrap the response inside \`\`\`json.
- Do NOT include explanations before or after the JSON.
- Do NOT include any extra text.

The response MUST be a JSON array in the following format:

[
    {
        "question": "Question text",
        "expectedAnswer": "Detailed ideal answer",
        "topic": "React",
        "difficulty": "Easy",
        "order": 1
    }
]

Rules:

- "difficulty" must only be one of:
  - Easy
  - Medium
  - Hard

- "order" should start from 1 and increment sequentially.

- "topic" should be a single primary topic such as:
  - JavaScript
  - TypeScript
  - React
  - Next.js
  - HTML
  - CSS
  - Node.js
  - Express
  - MongoDB
  - System Design
  - Behavioral

Return ONLY the JSON array.
`;
}

async function generateQuestionsFromAI(prompt) {
    try {
        const response = await getAI().models.generateContent({
            model: process.env.GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            },
        });

        const text = response.text;

        if (!text) {
            throw new Error('Empty response received from Gemini');
        }

        return JSON.parse(text);
    } catch (error) {
        console.error('Gemini Error:', error);
        throw new Error('Failed to generate questions from AI');
    }
}

function buildEvaluationPrompt({
    question,
    expectedAnswer,
    userAnswer,
}) {
    return `
You are a senior software engineering interviewer evaluating a candidate's answer.

Evaluate the candidate's response based on correctness, completeness, technical depth, and communication.

Interview Question:

${question}


Expected Ideal Answer:

${expectedAnswer}


Candidate Answer:

${userAnswer}


Evaluation Instructions:

- Compare the candidate answer with the expected answer.
- Score technical accuracy separately from communication clarity.
- Identify missing concepts the candidate should have covered.
- Give constructive feedback.
- Mention what was done well.
- Mention specific improvements.

Return ONLY valid JSON.

Do not include markdown.
Do not include explanations outside JSON.

The response MUST follow this exact format:

{
    "technicalScore": 7,
    "communicationScore": 8,
    "score": 7.5,
    "feedback": "Detailed feedback about the answer",
    "strengths": [
        "Strength 1",
        "Strength 2"
    ],
    "improvements": [
        "Improvement 1",
        "Improvement 2"
    ],
    "missingConcepts": [
        "Missing concept 1",
        "Missing concept 2"
    ]
}


Rules:

- technicalScore must be a number between 0 and 10.
- communicationScore must be a number between 0 and 10.
- score must be a number between 0 and 10 (average of technical and communication scores).
- strengths must always be an array.
- improvements must always be an array.
- missingConcepts must always be an array (empty if none).
- feedback must be a string.

Return ONLY JSON.
`;
}

async function evaluateAnswerFromAI(prompt) {
    try {
        const response = await getAI().models.generateContent({
            model: process.env.GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            },
        });

        const text = response.text;

        if (!text) {
            throw new Error(
                'Empty response received from Gemini'
            );
        }

        return JSON.parse(text);
    } catch (error) {
        console.error(
            'Gemini Evaluation Error:',
            error
        );

        throw new Error(
            'Failed to evaluate answer from AI'
        );
    }
}

function buildFollowUpPrompt({
    question,
    expectedAnswer,
    topic,
    difficulty,
}) {
    return `
You are an experienced Senior Software Engineering Interviewer.

A candidate just practiced this interview question. Generate exactly 3 follow-up questions that an interviewer would naturally ask next.

Original Question:

${question}

Expected Answer Context:

${expectedAnswer}

Topic: ${topic}
Difficulty: ${difficulty}

Generate:
1. A deeper technical follow-up that probes understanding further
2. A practical scenario / real-world application follow-up
3. A typical interviewer expected follow-up (edge cases, trade-offs, or clarification)

Return ONLY valid JSON.
Do NOT include markdown.
Do NOT wrap the response inside \`\`\`json.
Do NOT include explanations before or after the JSON.

The response MUST be a JSON array in the following format:

[
    {
        "question": "Follow-up question text",
        "expectedAnswer": "Detailed ideal answer",
        "topic": "${topic}",
        "difficulty": "Medium",
        "order": 1
    }
]

Rules:

- Exactly 3 items.
- "difficulty" must only be Easy, Medium, or Hard.
- "order" should be 1, 2, 3.
- "topic" should stay related to the original topic.

Return ONLY the JSON array.
`;
}

async function generateFollowUpsFromAI(prompt) {
    try {
        const response = await getAI().models.generateContent({
            model: process.env.GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            },
        });

        const text = response.text;

        if (!text) {
            throw new Error('Empty response received from Gemini');
        }

        return JSON.parse(text);
    } catch (error) {
        console.error('Gemini Follow-up Error:', error);
        throw new Error('Failed to generate follow-up questions from AI');
    }
}

module.exports = {
    buildQuestionPrompt,
    generateQuestionsFromAI,
    buildEvaluationPrompt,
    evaluateAnswerFromAI,
    buildFollowUpPrompt,
    generateFollowUpsFromAI,
};
