const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkWriteDataAuth } = require("../../utils/middleware");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/edit/languages", async (req, res) => {
  const resumeId = req.params.resumeId;

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

router.post("/:resumeId/edit/languages", checkWriteDataAuth, async (req, res) => {
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
    message: "languages data updated",
  });
});

module.exports = router;
