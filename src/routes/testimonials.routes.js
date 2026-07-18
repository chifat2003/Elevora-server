const express = require("express");
const { getDB } = require("../config/db");

const router = express.Router();

// GET /api/testimonials
router.get("/", async (req, res) => {
  const testimonials = await getDB()
    .collection("testimonials")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  res.json(testimonials);
});

module.exports = router;
