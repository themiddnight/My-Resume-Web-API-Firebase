const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const { checkOwner } = require("../../utils/middleware");
const uploadStorage = require("../../utils/uploadStorage");

const router = express.Router();
const db = getFirestore();
const bucket = getStorage().bucket();

// API
router.get("/:resumeId/certifications", checkOwner, async (req, res) => {
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
  const personalcertificationsSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("certifications")
    .get();
  const personalcertifications = personalcertificationsSnap.data();

  res.json(personalcertifications);
});

/* 
data: {
  active: boolean,
  title: string,
  issuedBy: string,
  issuedDate: string,
  credentialUrl: string,
  image_file: base64,
  image_path: string,
  image_url: string,
}
deleted_image_paths: string[]
*/
router.put("/:resumeId/certifications", checkOwner, async (req, res) => {
  const userId = req.user_id;
  const resumeId = req.params.resumeId;
  const {
    title,
    subtitle,
    active,
    display_limit,
    data,
    deleted_image_paths,
  } = req.body;

  const certifications_data = {
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
      "certifications",
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
    .doc("certifications")
    .set(certifications_data);

  res.status(201).json({
    message: "Certifications data updated",
  });
});

module.exports = router;
