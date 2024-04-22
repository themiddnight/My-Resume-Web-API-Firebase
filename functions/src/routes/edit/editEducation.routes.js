const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkOwner } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

router.get("/:resumeId/education", checkOwner, async (req, res) => {
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
  const educationSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("education")
    .get();
  const education = educationSnap.data();

  res.json(education);
});

/** 'data' structure:
 *
 * active: boolean
 * title: string
 * degree: string
 * school: string
 * from: string
 * to: string
 * current: boolean
 */
router.put("/:resumeId/education", checkOwner, async (req, res) => {
  const userId = req.user_id;
  const resumeId = req.params.resumeId;
  const { title, subtitle, active, display_limit, data } = req.body;

  const resumeRef = db.collection("resumes");
  await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("education")
    .set({ title, subtitle, active, display_limit, data });

  res.status(201).json({
    message: "Education data updated",
  });
});

module.exports = router;
