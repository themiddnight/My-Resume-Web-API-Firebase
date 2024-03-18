const express = require("express");
const { db } = require("../db");
const { checkWriteDataAuth } = require("../middleware");

const router = express.Router();

router.get("/page_config", async (req, res) => {
  const snapshot = await db.collection("page_config").get();
  const data = snapshot.docs[0].data();
  console.log(data)
  res.json(data);
});

router.patch("/page_config", checkWriteDataAuth, async (req, res) => {
  const { id, ...data } = req.body;
  const docRef = db.collection("page_config").doc(id);
  await docRef.update(data);
  const doc = await docRef.get();
  res.json(doc.data());
});

module.exports = router;