const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { ApiError } = require("../middleware/errorHandler");

const router = express.Router();

const SORTS = {
  newest: { createdAt: -1 },
  salary_asc: { salaryMin: 1 },
  salary_desc: { salaryMax: -1 },
};

// GET /api/jobs — search, filter, sort, paginate
router.get("/", async (req, res) => {
  const {
    q,
    category,
    type,
    location,
    experienceLevel,
    minSalary,
    maxSalary,
    sort = "newest",
    page = "1",
    limit = "8",
  } = req.query;

  const filter = {};
  if (q) filter.title = { $regex: q, $options: "i" };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (location) filter.location = { $regex: location, $options: "i" };
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (minSalary || maxSalary) {
    filter.salaryMax = filter.salaryMax || {};
    if (minSalary) filter.salaryMax.$gte = Number(minSalary);
    if (maxSalary) filter.salaryMin = { $lte: Number(maxSalary) };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(24, Math.max(1, parseInt(limit, 10) || 8));
  const sortSpec = SORTS[sort] || SORTS.newest;

  const jobs = getDB().collection("jobs");
  const [items, total] = await Promise.all([
    jobs
      .find(filter)
      .sort(sortSpec)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    jobs.countDocuments(filter),
  ]);

  res.json({
    jobs: items,
    total,
    page: pageNum,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  });
});

// GET /api/jobs/categories — distinct filter values for the UI
router.get("/categories", async (req, res) => {
  const jobs = getDB().collection("jobs");
  const distinctValues = async (field) => {
    const result = await jobs
      .aggregate([{ $group: { _id: `$${field}` } }])
      .toArray();
    return result.map((r) => r._id).filter(Boolean).sort();
  };
  const [categories, types, experienceLevels] = await Promise.all([
    distinctValues("category"),
    distinctValues("type"),
    distinctValues("experienceLevel"),
  ]);
  res.json({ categories, types, experienceLevels });
});

// GET /api/jobs/:id
router.get("/:id", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(404, "Job not found"));
  }
  const job = await getDB()
    .collection("jobs")
    .findOne({ _id: new ObjectId(req.params.id) });
  if (!job) return next(new ApiError(404, "Job not found"));
  res.json(job);
});

// GET /api/jobs/:id/related
router.get("/:id/related", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(404, "Job not found"));
  }
  const jobs = getDB().collection("jobs");
  const job = await jobs.findOne({ _id: new ObjectId(req.params.id) });
  if (!job) return next(new ApiError(404, "Job not found"));

  const related = await jobs
    .find({ _id: { $ne: job._id }, category: job.category })
    .limit(3)
    .toArray();
  res.json(related);
});

// POST /api/jobs — create a job posting
router.post("/", async (req, res, next) => {
  const {
    title,
    shortDescription,
    fullDescription,
    location,
    type,
    category,
    experienceLevel,
    salaryMin,
    salaryMax,
    currency = "USD",
    deadline,
    imageUrl,
    recruiterId,
    recruiterName,
  } = req.body;

  if (
    !title ||
    !shortDescription ||
    !fullDescription ||
    !location ||
    !type ||
    !category ||
    !experienceLevel ||
    salaryMin == null ||
    salaryMax == null ||
    !deadline ||
    !recruiterId
  ) {
    return next(new ApiError(400, "Missing required job fields"));
  }

  const job = {
    title,
    shortDescription,
    fullDescription,
    location,
    type,
    category,
    experienceLevel,
    salaryMin: Number(salaryMin),
    salaryMax: Number(salaryMax),
    currency,
    deadline,
    imageUrl: imageUrl || null,
    recruiterId,
    recruiterName: recruiterName || null,
    createdAt: new Date().toISOString(),
  };

  const result = await getDB().collection("jobs").insertOne(job);
  res.status(201).json({ ...job, _id: result.insertedId });
});

// DELETE /api/jobs/:id
router.delete("/:id", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(404, "Job not found"));
  }
  const { recruiterId } = req.body;
  const jobs = getDB().collection("jobs");
  const job = await jobs.findOne({ _id: new ObjectId(req.params.id) });
  if (!job) return next(new ApiError(404, "Job not found"));
  if (recruiterId && job.recruiterId !== recruiterId) {
    return next(new ApiError(403, "You do not own this job posting"));
  }
  await jobs.deleteOne({ _id: job._id });
  res.status(204).send();
});

module.exports = router;
