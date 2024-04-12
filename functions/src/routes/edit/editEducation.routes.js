const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkWriteDataAuth } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/edit/education", async (req, res) => {
  const resumeId = req.params.resumeId;

  const resumeRef = db.collection("resumes");
  const educationSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("education")
    .get();
  const education = educationSnap.data();

  res.json(education);
});

router.put("/:resumeId/edit/education", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { title, subtitle, active, display_limit, data } = req.body;

  const resumeRef = db.collection("resumes");
  const result = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("education")
    .set({ title, subtitle, active, display_limit, data });

  res.status(201).json({
    message: "Education data updated",
  });
});

module.exports = router;
