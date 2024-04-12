const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const { checkWriteDataAuth } = require("../../utils/middleware");
const uploadStorage = require("../../utils/uploadStorage");

const router = express.Router();
const db = getFirestore();
const bucket = getStorage().bucket();

// API
router.get("/:resumeId/edit/tools", async (req, res) => {
  const resumeId = req.params.resumeId;

  const resumeRef = db.collection("resumes");
  const personaltoolsSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("tools")
    .get();
  const personaltools = personaltoolsSnap.data();

  res.json(personaltools);
});

/* 
data: {
  active: boolean,
  title: string,
  description: string,
  image_file: base64,
  image_path: string,
  image_url: string,
  isMono: boolean
}
deleted_image_paths: string[]
*/

router.put("/:resumeId/edit/tools", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const {
    title,
    subtitle,
    active,
    display_limit,
    display_mode,
    data,
    deleted_image_paths,
  } = req.body;

  const tools_data = {
    title,
    subtitle,
    active,
    display_limit,
    display_mode,
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
      "tools",
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
    .doc("tools")
    .set(tools_data);

  res.status(201).json({
    message: "tools data updated",
  });
});

module.exports = router;
