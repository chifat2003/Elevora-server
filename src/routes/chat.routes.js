const express = require("express");
const { getDB } = require("../config/db");
const { getAnthropicClient } = require("../config/anthropic");
const { ApiError } = require("../middleware/errorHandler");

const router = express.Router();

const SYSTEM_PROMPT = `You are the Elevora assistant, built into a job search and recruiting platform.

Elevora connects job seekers and recruiters. Job seekers can search and filter listings at /jobs (by category, type, location, salary, experience), view details at /jobs/:id, apply, and save jobs. Recruiters post jobs at /items/add and manage their postings at /items/manage; job seekers use /items/manage to see their applications and saved jobs. Both roles have a /profile page. The homepage at / has featured jobs, categories, platform stats, testimonials, and a blog.

Help users find jobs, explain how to use the platform, and answer questions about hiring or job searching in general. When suggesting they take an action (like browsing jobs or posting one), name the specific route. Keep responses concise and conversational.`;

// GET /api/chat — conversation history for a user
router.get("/", async (req, res, next) => {
  const { userId } = req.query;
  if (!userId) return next(new ApiError(400, "userId is required"));

  const messages = await getDB()
    .collection("chatMessages")
    .find({ userId, conversationId: userId })
    .sort({ createdAt: 1 })
    .toArray();
  res.json(messages);
});

// POST /api/chat/stream — send a message, stream the assistant's reply as SSE
router.post("/stream", async (req, res, next) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return next(new ApiError(400, "userId and message are required"));
  }

  const conversationId = userId;
  const chatMessages = getDB().collection("chatMessages");

  await chatMessages.insertOne({
    userId,
    conversationId,
    role: "user",
    content: message,
    createdAt: new Date().toISOString(),
  });

  const history = await chatMessages
    .find({ userId, conversationId })
    .sort({ createdAt: 1 })
    .toArray();
  const apiMessages = history.map((m) => ({ role: m.role, content: m.content }));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const client = getAnthropicClient();
    const stream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    });

    stream.on("text", (delta) => {
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    });

    const final = await stream.finalMessage();
    const assistantText = final.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    await chatMessages.insertOne({
      userId,
      conversationId,
      role: "assistant",
      content: assistantText,
      createdAt: new Date().toISOString(),
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message || "AI request failed" })}\n\n`);
    res.end();
  }
});

module.exports = router;
