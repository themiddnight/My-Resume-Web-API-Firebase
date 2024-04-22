const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkOwner } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/other_links", checkOwner, async (req, res) => {
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
  const other_linksSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("other_links")
    .get();
  const other_links = other_linksSnap.data();

  res.json(other_links);
});

router.put("/:resumeId/other_links", checkOwner, async (req, res) => {
  const userId = req.user_id;
  const resumeId = req.params.resumeId;
  const { title, subtitle, active, display_limit, data } = req.body;

  const resumeRef = db.collection("resumes");
  const result = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("other_links")
    .set({ title, subtitle, active, display_limit, data });

  res.status(201).json({
    message: "Other Links data updated",
  });
});

module.exports = router;
