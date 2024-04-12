const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkWriteDataAuth } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/edit/settings", async (req, res) => {
  const resumeId = req.params.resumeId;

  const resumeRef = db.collection("resumes");
  const settingsSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("settings")
    .get();
  const settings = settingsSnap.data();

  res.json(settings);
});

router.put("/:resumeId/edit/settings", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { layout, background_mode, intro } = req.body;
  const data = {
    layout,
    background_mode,
    intro,
  };

  const resumeRef = db.collection("resumes");
  const result = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("settings")
    .set(data);

  res.status(201).json({
    message: "settings data updated",
  });
});

module.exports = router;
