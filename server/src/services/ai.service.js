

const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Constants ───────────────────────────────────────────────
const MODEL = "openai/gpt-oss-20b";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ─── Helpers ─────────────────────────────────────────────────
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function validateResumeText(text) {
  if (!text || typeof text !== "string") {
    throw new Error("INVALID_INPUT: Resume text must be a non-empty string.");
  }
  const trimmed = text.trim();
  if (trimmed.length < 50) {
    throw new Error("INVALID_INPUT: Resume text too short to analyze.");
  }
  if (trimmed.length > 15000) {
    throw new Error("INVALID_INPUT: Resume text exceeds maximum allowed length.");
  }
  return trimmed;
}

// ─── Prompt ──────────────────────────────────────────────────
function buildPrompt(text) {
  return `You are a senior ATS (Applicant Tracking System) expert and career coach with 15+ years of experience in recruiting.

Analyze the following resume against real-world ATS systems (Workday, Greenhouse, Lever, Taleo) and return a detailed evaluation.

SCORING RUBRIC (total 100 points):
- Keyword Density & Relevance     : 25 pts
- Work Experience Quality         : 20 pts
- Quantified Achievements         : 20 pts
- Formatting & ATS Parseability   : 15 pts
- Skills Section Completeness     : 10 pts
- Education & Certifications      : 10 pts

Return ONLY a valid JSON object with this exact schema:
{
  "score": <integer 0–100>,
  "grade": <"A" | "B" | "C" | "D" | "F">,
  "scoreBreakdown": {
    "keywordDensity": <0–25>,
    "workExperience": <0–20>,
    "quantifiedAchievements": <0–20>,
    "formatting": <0–15>,
    "skillsSection": <0–10>,
    "education": <0–10>
  },
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "suggestions": [<string>, ...],
  "missingKeywords": [<string>, ...],
  "detectedSections": {
    "hasContactInfo": <boolean>,
    "hasSummary": <boolean>,
    "hasExperience": <boolean>,
    "hasEducation": <boolean>,
    "hasSkills": <boolean>,
    "hasCertifications": <boolean>,
    "hasProjects": <boolean>
  },
  "overallFeedback": <string — 2–3 sentence executive summary>
}

Resume Text:
---
${text}
---`;
}

// ─── Core Analyzer with Retry ─────────────────────────────────
async function callGroqWithRetry(text, attempt = 1) {
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a strict ATS evaluation engine. You ONLY respond with valid JSON. No markdown, no explanation, no extra text.",
        },
        {
          role: "user",
          content: buildPrompt(text),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,      // lower = more consistent/deterministic output
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content?.trim();

    if (!raw) throw new Error("EMPTY_RESPONSE: AI returned no content.");

    const parsed = JSON.parse(raw);

    // ── Sanity check the response shape ──
    if (
      typeof parsed.score !== "number" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.weaknesses)
    ) {
      throw new Error("INVALID_SCHEMA: AI response missing required fields.");
    }

    return parsed;

  } catch (error) {
    const isRetryable =
      error.message?.includes("rate_limit") ||
      error.message?.includes("503") ||
      error.message?.includes("timeout") ||
      error.status === 429 ||
      error.status === 503;

    if (isRetryable && attempt < MAX_RETRIES) {
      console.warn(`⚠️  Groq retry ${attempt}/${MAX_RETRIES}: ${error.message}`);
      await delay(RETRY_DELAY_MS * attempt); // exponential-ish backoff
      return callGroqWithRetry(text, attempt + 1);
    }

    throw error; // bubble up to controller
  }
}

// ─── Public API ───────────────────────────────────────────────
async function analyzeResume(text) {
  const validated = validateResumeText(text);
  const result = await callGroqWithRetry(validated);

  // Clamp score just in case AI hallucinates out-of-range value
  result.score = Math.min(100, Math.max(0, Math.round(result.score)));

  // Derive grade if AI skipped it
  if (!result.grade) {
    if (result.score >= 85) result.grade = "A";
    else if (result.score >= 70) result.grade = "B";
    else if (result.score >= 55) result.grade = "C";
    else if (result.score >= 40) result.grade = "D";
    else result.grade = "F";
  }

  return result;
}

module.exports = { analyzeResume };
