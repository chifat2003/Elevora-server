const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { ApiError } = require("../middleware/errorHandler");

const router = express.Router();

// POST /api/saved-jobs — save a job
router.post("/", async (req, res, next) => {
  const { jobId, seekerId } = req.body;

  if (!jobId || !seekerId || !ObjectId.isValid(jobId)) {
    return next(new ApiError(400, "jobId and seekerId are required"));
  }

  const db = getDB();
  const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
  if (!job) return next(new ApiError(404, "Job not found"));

  const existing = await db
    .collection("savedJobs")
    .findOne({ jobId, seekerId });
  if (existing) {
    return next(new ApiError(409, "Job already saved"));
  }

  const savedJob = { jobId, seekerId, savedAt: new Date().toISOString() };
  const result = await db.collection("savedJobs").insertOne(savedJob);
  res.status(201).json({ ...savedJob, _id: result.insertedId });
});

// GET /api/saved-jobs?seekerId=xxx — saved jobs with job details attached
router.get("/", async (req, res, next) => {
  const { seekerId } = req.query;
  if (!seekerId) return next(new ApiError(400, "seekerId is required"));

  const savedJobs = await getDB()
    .collection("savedJobs")
    .aggregate([
      { $match: { seekerId } },
      { $sort: { savedAt: -1 } },
      { $addFields: { jobObjectId: { $toObjectId: "$jobId" } } },
      {
        $lookup: {
          from: "jobs",
          localField: "jobObjectId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },
      { $project: { jobObjectId: 0 } },
    ])
    .toArray();

  res.json(savedJobs);
});

// DELETE /api/saved-jobs/:id — unsave a job
router.delete("/:id", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(404, "Saved job not found"));
  }
  const { seekerId } = req.body;
  const savedJobs = getDB().collection("savedJobs");
  const savedJob = await savedJobs.findOne({ _id: new ObjectId(req.params.id) });
  if (!savedJob) return next(new ApiError(404, "Saved job not found"));
  if (seekerId && savedJob.seekerId !== seekerId) {
    return next(new ApiError(403, "You do not own this saved job"));
  }
  await savedJobs.deleteOne({ _id: savedJob._id });
  res.status(204).send();
});

module.exports = router;
