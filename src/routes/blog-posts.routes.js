const express = require("express");
const { getDB } = require("../config/db");
const { ApiError } = require("../middleware/errorHandler");

const router = express.Router();

// GET /api/blog-posts — list, newest first
router.get("/", async (req, res) => {
  const posts = await getDB()
    .collection("blogPosts")
    .find({}, { projection: { content: 0 } })
    .sort({ publishedAt: -1 })
    .toArray();
  res.json(posts);
});

// GET /api/blog-posts/:slug — full post
router.get("/:slug", async (req, res, next) => {
  const post = await getDB()
    .collection("blogPosts")
    .findOne({ slug: req.params.slug });
  if (!post) return next(new ApiError(404, "Blog post not found"));
  res.json(post);
});

module.exports = router;
