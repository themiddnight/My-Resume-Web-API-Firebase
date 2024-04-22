const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const { checkOwner } = require("../../utils/middleware");
const uploadStorage = require("../../utils/uploadStorage");

const router = express.Router();
const db = getFirestore();

// API
router.get("/:resumeId/settings", checkOwner, async (req, res) => {
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
  const settingsSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("settings")
    .get();
  const settings = settingsSnap.data();

  res.json(settings);
});

/* 
data: {
  layout: string,
  background: {
    mode: number,
    color: string,
    image_url: string,
    image_file: base64,    
  },
  intro: {
    title: string,
    subtitle: string,
    enter_button: string,
  }
}
*/
router.put("/:resumeId/settings", checkOwner, async (req, res) => {
  const userId = req.user_id;
  const resumeId = req.params.resumeId;
  const { layout, background, intro } = req.body;

  if (background.image_file) {
    const { imageUrl, imagePath } = await uploadStorage(
      resumeId,
      "settings",
      background.image_url,
      background.image_file,
      background.image_path
    );
    background.image_url = imageUrl;
    background.image_path = imagePath;
    delete background.image_file;
  }

  const data = {
    layout,
    background,
    intro,
  };

  const resumeRef = db.collection("resumes");
  const result = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("settings")
    .set(data);

  res.status(201).json({
    message: "Settings data updated",
  });
});

module.exports = router;
