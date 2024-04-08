const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkWriteDataAuth } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/edit/other_links", async (req, res) => {
  const resumeId = req.params.resumeId;

  const resumeRef = db.collection("resumes");
  const other_linksSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("other_links")
    .get();
  const other_links = other_linksSnap.data();

  res.json(other_links);
});

router.post("/:resumeId/edit/other_links", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { title, subtitle, active, display_limit, data } = req.body;

  const resumeRef = db.collection("resumes");
  const result = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("other_links")
    .set({ title, subtitle, active, display_limit, data });

  res.status(201).json({
    message: "other_links data updated",
  });
});

module.exports = router;
