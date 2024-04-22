const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkOwner } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/languages", checkOwner, async (req, res) => {
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
  const personaltoolsSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("languages")
    .get();
  const personaltools = personaltoolsSnap.data();

  res.json(personaltools);
});

/* 
data: {
  active: boolean,
  title: string,
  native: boolean,
  read: { value: number, level: string },
  write: { value: number, level: string },
  listen: { value: number, level: string },
  speak: { value: number, level: string },
}
*/
router.put("/:resumeId/languages", checkOwner, async (req, res) => {
  const userId = req.user_id;
  const resumeId = req.params.resumeId;
  const {
    title,
    subtitle,
    active,
    display_limit,
    data,
  } = req.body;

  const languages_data = {
    title,
    subtitle,
    active,
    display_limit,
    data,
  };

  await db
    .collection("resumes")
    .doc(resumeId)
    .collection("data")
    .doc("languages")
    .set(languages_data);

  res.status(201).json({
    message: "Languages data updated",
  });
});

module.exports = router;
