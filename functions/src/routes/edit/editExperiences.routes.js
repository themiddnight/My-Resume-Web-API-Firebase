const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkWriteDataAuth } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/edit/experiences", async (req, res) => {
  const resumeId = req.params.resumeId;

  const resumeRef = db.collection("resumes");
  const experiencesSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("experiences")
    .get();
  const experiences = experiencesSnap.data();

  res.json(experiences);
});

router.put("/:resumeId/edit/experiences", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { title, subtitle, active, display_limit, data } = req.body;

  const resumeRef = db.collection("resumes");
  const result = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("experiences")
    .set({ title, subtitle, active, display_limit, data });

  res.status(201).json({
    message: "Experiences data updated",
  });
});

module.exports = router;
