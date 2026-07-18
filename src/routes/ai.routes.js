const express = require("express");
const { callOpenRouter } = require("../config/openrouter");
const { ApiError } = require("../middleware/errorHandler");

const router = express.Router();

const LENGTH_GUIDANCE = {
  concise:
    "Keep the short description under 20 words and the full description to 2 short paragraphs.",
  standard:
    "Keep the short description to 1-2 sentences and the full description to 3-4 paragraphs.",
  detailed:
    "Write a thorough short description (2 sentences) and a detailed full description of 5+ paragraphs covering responsibilities, requirements, and what makes the role compelling.",
};

// POST /api/ai/generate-job — structured job posting draft
router.post("/generate-job", async (req, res, next) => {
  const { role, seniority, keySkills, companyBlurb, length = "standard" } = req.body;
  if (!role || !seniority) {
    return next(new ApiError(400, "role and seniority are required"));
  }

  const guidance = LENGTH_GUIDANCE[length] || LENGTH_GUIDANCE.standard;

  const prompt = `Draft a job posting for Elevora, a job search and recruiting platform.

Role: ${role}
Seniority: ${seniority}
Key skills: ${keySkills || "not specified"}
Company blurb: ${companyBlurb || "not specified"}

Write three fields, each following its own instructions:

TITLE — a specific, searchable job title (e.g. "Senior Backend Engineer", not just "Engineer"). No company name, no fluff.

SHORT DESCRIPTION — a 1-2 line hook for a job listing card that would make someone want to click "View Details." ${guidance}

FULL DESCRIPTION — the complete posting shown on the job details page: what the role does day-to-day, who the team is (use the company blurb if given), and what's expected of the candidate (use the key skills if given). ${guidance}

Do not use placeholder brackets like [Company Name] — write natural prose. Do not repeat the same sentence across fields.

Respond with ONLY a JSON object of the exact shape {"title": string, "shortDescription": string, "fullDescription": string} — no markdown fences, no other text.`;

  try {
    const upstream = await callOpenRouter({
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" },
      maxTokens: 1200,
    });
    const data = await upstream.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return next(new ApiError(502, "AI response did not include content"));
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return next(new ApiError(502, "AI response was not valid JSON"));
    }
    res.json(parsed);
  } catch (err) {
    next(new ApiError(502, err.message || "AI generation failed"));
  }
});

module.exports = router;
