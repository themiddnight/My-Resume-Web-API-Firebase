const express = require("express");
const { db } = require("../db");
const { checkWriteDataAuth } = require("../middleware");

const router = express.Router();

router.get("/public_notes", async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const collection = db.collection("public_notes");
  const snapshot = await collection
    .orderBy("createdAt", "desc")
    .limit(limit)
    .offset(offset)
    .get();

  const data = snapshot.docs.map((doc) => doc.data());
  res.json(data);
});

router.post("/public_notes", checkWriteDataAuth, async (req, res) => {
  const { content } = req.body;
  const createdAt = new Date();
  let number;
  try {
    const latestNoSnapshot = await db
      .collection("public_notes")
      .orderBy("number", "desc")
      .limit(1)
      .get();
    const latestNo = latestNoSnapshot.docs[0].data().number || 0;
    number = latestNo + 1;
  } catch (error) {
    number = 1;
  }

  const collection = db.collection("public_notes");
  const docRef = await collection.add({ number, content, createdAt });
  const doc = await docRef.get();

  res.json(doc.data());
});

module.exports = router;
