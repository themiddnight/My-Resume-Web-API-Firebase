const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkOwner } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/public_notes", checkOwner, async (req, res) => {
  const userId = req.user_id;
  const resumeId = req.params.resumeId;

  // get user data. check if user is the owner of the resume
  const resumeDocRef = db.collection("resumes").doc(resumeId);
  const resumeUserId = (await resumeDocRef.get()).data().user_id;

  if (userId !== resumeUserId) {
    res.status(403).json({
      status_code: 403,
      message: "Forbidden",
    });
    return;
  }

  const resumeRef = db.collection("resumes");
  const public_notesSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("public_notes")
    .get();
  const public_notes = public_notesSnap.data();

  res.json(public_notes);
});

router.put("/:resumeId/public_notes", checkOwner, async (req, res) => {
  const userId = req.user_id;
  const resumeId = req.params.resumeId;
  const { title, subtitle, active, display_limit } = req.body;

  const resumeRef = db.collection("resumes");
  const result = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("public_notes")
    .set({ title, subtitle, active, display_limit });

  res.status(201).json({
    message: "Public Notes data updated",
  });
});

module.exports = router;
