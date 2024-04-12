const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkWriteDataAuth } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/edit/public_notes", async (req, res) => {
  const resumeId = req.params.resumeId;

  const resumeRef = db.collection("resumes");
  const public_notesSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("public_notes")
    .get();
  const public_notes = public_notesSnap.data();

  res.json(public_notes);
});

router.put("/:resumeId/edit/public_notes", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { title, subtitle, active, display_limit } = req.body;

  const resumeRef = db.collection("resumes");
  const result = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("public_notes")
    .set({ title, subtitle, active, display_limit });

  res.status(201).json({
    message: "public_notes data updated",
  });
});

module.exports = router;
