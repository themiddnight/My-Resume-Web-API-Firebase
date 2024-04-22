const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkOwner } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/about", checkOwner, async (req, res) => {
  const resumeId = req.params.resumeId;

  const resumeRef = db.collection("resumes");
  const aboutSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("about")
    .get();
  const about = aboutSnap.data();

  res.json(about);
});

router.put("/:resumeId/about", checkOwner, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { title, active, data } = req.body;

  const resumeRef = db.collection("resumes");
  const result = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("about")
    .set({ title, active, data });

  res.status(201).json({
    message: "About data updated",
  });
});

module.exports = router;
