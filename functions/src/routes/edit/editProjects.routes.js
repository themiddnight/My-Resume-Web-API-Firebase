const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const { checkWriteDataAuth } = require("../../utils/middleware");
const uploadStorage = require("../../utils/uploadStorage");

const router = express.Router();
const db = getFirestore();
const bucket = getStorage().bucket();

// API
router.get("/:resumeId/edit/projects", async (req, res) => {
  const resumeId = req.params.resumeId;

  const resumeRef = db.collection("resumes");
  const personalProjectsSnap = await resumeRef
    .doc(resumeId)
    .collection("data")
    .doc("projects")
    .get();
  const personalProjects = personalProjectsSnap.data();

  res.json(personalProjects);
});

/* data:
{
  title: string,
  tags: string[],
  image_file: base64,
  image_path: string,
  image_url: string,
  description: string,
  public_link: string,
  links: [
    {
      title: string,
      url: string
    }
  ],
  createdAt: string
}
*/

router.post("/:resumeId/edit/projects", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { title, subtitle, active, display_limit, data, deleted_image_paths } =
    req.body;

  const projects_data = {
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
      "projects",
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
    .doc("projects")
    .set(projects_data);

  res.status(201).json({
    message: "Personal projects data updated",
  });
});

module.exports = router;
