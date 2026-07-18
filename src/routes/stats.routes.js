const express = require("express");
const { getDB } = require("../config/db");

const router = express.Router();

// GET /api/stats — live platform aggregates for the landing page
router.get("/", async (req, res) => {
  const db = getDB();
  const jobs = db.collection("jobs");
  const applications = db.collection("applications");

  const [jobsPosted, companies, applicationsSubmitted] = await Promise.all([
    jobs.countDocuments(),
    jobs.aggregate([{ $group: { _id: "$recruiterName" } }]).toArray(),
    applications.countDocuments(),
  ]);

  res.json({
    jobsPosted,
    companiesHiring: companies.filter((c) => c._id).length,
    applicationsSubmitted,
  });
});

module.exports = router;
