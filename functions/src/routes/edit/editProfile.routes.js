const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkOwner } = require("../../utils/middleware");
const uploadStorage = require("../../utils/uploadStorage");

const router = express.Router();
const db = getFirestore();

router.get("/:resumeId/profile", checkOwner, async (req, res) => {
  const resumeId = req.params.resumeId;

  // get resume profile data
  const resumeRef = db.collection("resumes");
  const profileSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("profile")
    .get();

  const profile = profileSnap.data();

  // get user data
  const resumeDocRef = db.collection("resumes").doc(resumeId);
  const resumeUserId = (await resumeDocRef.get()).data().user_id;

  const userRef = db.collection("users");
  const userSnap = await userRef.doc(resumeUserId).get();

  // add user name to profile title
  profile.title = userSnap.data().name;

  res.json(profile);
});

router.put("/:resumeId/profile", checkOwner, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { image_url, image_path, subtitle, contact, links, image_file } =
    req.body;
    
  const data = {
    image_url,
    image_path,
    subtitle,
    contact,
    links,
  };

  try {
    const { imageUrl, imagePath } = await uploadStorage(
      resumeId,
      "profile",
      image_url,
      image_file,
      image_path
    );
    data.image_url = imageUrl;
    data.image_path = imagePath;
    delete data.image_file;

    await db
      .collection("resumes")
      .doc(resumeId)
      .collection("data")
      .doc("profile")
      .set(data);

    res.status(200).json({
      message: "Profile data updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      error: "Internal server error",
    });
  }
});

module.exports = router;
