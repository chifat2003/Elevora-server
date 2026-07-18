require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./src/config/db");
const { notFoundHandler, errorHandler } = require("./src/middleware/errorHandler");
const healthRoutes = require("./src/routes/health.routes");
const jobsRoutes = require("./src/routes/jobs.routes");
const applicationsRoutes = require("./src/routes/applications.routes");
const savedJobsRoutes = require("./src/routes/saved-jobs.routes");
const blogPostsRoutes = require("./src/routes/blog-posts.routes");
const testimonialsRoutes = require("./src/routes/testimonials.routes");
const statsRoutes = require("./src/routes/stats.routes");
const newsletterRoutes = require("./src/routes/newsletter.routes");
const chatRoutes = require("./src/routes/chat.routes");
const aiRoutes = require("./src/routes/ai.routes");

const app = express();
const port = process.env.PORT;

const allowedOrigins = process.env.CLIENT_URL.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "elevora-server", message: "API is running. See /api/* for endpoints." });
});

app.use("/api/health", healthRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/saved-jobs", savedJobsRoutes);
app.use("/api/blog-posts", blogPostsRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Elevora server listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
