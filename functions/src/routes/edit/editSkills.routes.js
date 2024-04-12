const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const { checkWriteDataAuth } = require("../../utils/middleware");
const uploadStorage = require("../../utils/uploadStorage");

const router = express.Router();
const db = getFirestore();
const bucket = getStorage().bucket();

// API
router.get("/:resumeId/edit/skills", async (req, res) => {
  const resumeId = req.params.resumeId;

  const resumeRef = db.collection("resumes");
  const personalskillsSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("skills")
    .get();
  const personalskills = personalskillsSnap.data();

  res.json(personalskills);
});

/* 
data: {
  active: boolean,
  title: string,
  level: string,
  description: string,
  image_file: base64,
  image_path: string,
  image_url: string,
  isMono: boolean
}
deleted_image_paths: string[]
*/

router.put("/:resumeId/edit/skills", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { title, subtitle, active, display_limit, data, deleted_image_paths } =
    req.body;

  const skills_data = {
    title,
    subtitle,
    active,
    display_limit,
    data,
  };

  if (deleted_image_paths) {
    const deletePromises = deleted_image_paths.map((path) => {
      if (path !== "") {
        bucket.file(path).delete();
      }
    });
    await Promise.all(deletePromises);
  }

  for (const item of data) {
    delete item.image_url_original;
    const { imageUrl, imagePath } = await uploadStorage(
      resumeId,
      "skills",
      item.image_url,
      item.image_file,
      item.image_path
    );

    item.image_url = imageUrl;
    item.image_path = imagePath;
    delete item.image_file;
  }

  await db
    .collection("resumes")
    .doc(resumeId)
    .collection("data")
    .doc("skills")
    .set(skills_data);

  res.status(201).json({
    message: "Skills data updated",
  });
});

module.exports = router;
