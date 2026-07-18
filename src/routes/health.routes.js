const express = require("express");
const { getDB } = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  await getDB().command({ ping: 1 });
  res.json({ status: "ok", service: "elevora-server" });
});

module.exports = router;
