const express = require("express");
const { getDB } = require("../config/db");
const { ApiError } = require("../middleware/errorHandler");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/newsletter — subscribe an email
router.post("/", async (req, res, next) => {
  const { email } = req.body;
  if (!email || !EMAIL_RE.test(email)) {
    return next(new ApiError(400, "A valid email is required"));
  }

  await getDB()
    .collection("newsletterSubscribers")
    .updateOne(
      { email },
      { $set: { email, subscribedAt: new Date().toISOString() } },
      { upsert: true }
    );

  res.status(201).json({ email });
});

module.exports = router;
