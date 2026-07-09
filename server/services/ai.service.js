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

function buildQuestionPrompt({
    company,
    role,
    experience,
    roundTitle,
    roundType,
    numberOfQuestions = 10,
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

Instructions:

- The questions should match the candidate's experience level.
- The questions should be relevant to the role and interview round.
- Include a balanced mix of:
  - Theory questions
  - Coding questions
  - Scenario-based questions
  - Best practice questions
- Keep the difficulty realistic for an actual interview.
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

module.exports = {
    buildQuestionPrompt,
    generateQuestionsFromAI,
};
