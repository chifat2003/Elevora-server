const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { ApiError } = require("../middleware/errorHandler");

const router = express.Router();

// POST /api/applications — apply to a job
router.post("/", async (req, res, next) => {
  const { jobId, seekerId, seekerName } = req.body;

  if (!jobId || !seekerId || !ObjectId.isValid(jobId)) {
    return next(new ApiError(400, "jobId and seekerId are required"));
  }

  const db = getDB();
  const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
  if (!job) return next(new ApiError(404, "Job not found"));

  const existing = await db
    .collection("applications")
    .findOne({ jobId, seekerId });
  if (existing) {
    return next(new ApiError(409, "You already applied to this job"));
  }

  const application = {
    jobId,
    seekerId,
    seekerName: seekerName || null,
    status: "submitted",
    appliedAt: new Date().toISOString(),
  };
  const result = await db.collection("applications").insertOne(application);
  res.status(201).json({ ...application, _id: result.insertedId });
});

// GET /api/applications?seekerId=xxx — applications with job details attached
router.get("/", async (req, res, next) => {
  const { seekerId } = req.query;
  if (!seekerId) return next(new ApiError(400, "seekerId is required"));

  const applications = await getDB()
    .collection("applications")
    .aggregate([
      { $match: { seekerId } },
      { $sort: { appliedAt: -1 } },
      {
        $addFields: {
          jobObjectId: { $toObjectId: "$jobId" },
        },
      },
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

  res.json(applications);
});

// DELETE /api/applications/:id — withdraw an application
router.delete("/:id", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(404, "Application not found"));
  }
  const { seekerId } = req.body;
  const applications = getDB().collection("applications");
  const application = await applications.findOne({
    _id: new ObjectId(req.params.id),
  });
  if (!application) return next(new ApiError(404, "Application not found"));
  if (seekerId && application.seekerId !== seekerId) {
    return next(new ApiError(403, "You do not own this application"));
  }
  await applications.deleteOne({ _id: application._id });
  res.status(204).send();
});

module.exports = router;
