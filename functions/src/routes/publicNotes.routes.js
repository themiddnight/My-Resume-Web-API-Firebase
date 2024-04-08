const express = require("express");
const { getFirestore } = require("firebase-admin/firestore");

const { checkWriteDataAuth } = require("../utils/middleware");

const router = express.Router();
const db = getFirestore();

router.get("/:resumeId/public_notes", async (req, res) => {
  const resumeId = req.params.resumeId;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const resumeRef = db.collection("resumes");
  const publicNotesSnap = await resumeRef
    .doc(resumeId)
    .collection("public_notes")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .offset(offset)
    .get();
  const publicNotesDocs = publicNotesSnap.docs;
  const publicNotes = [];

  publicNotesDocs.forEach((doc) => {
    publicNotes.push(doc.data());
  });

  res.json(publicNotes);
});

router.post("/:resumeId/public_notes", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const { content } = req.body;
  const createdAt = new Date();
  let number;

  const resumeRef = db.collection("resumes");
  const publicNotesSnap = await resumeRef
    .doc(resumeId)
    .collection("public_notes")
    .orderBy("number", "desc")
    .limit(1)
    .get();
  const publicNotesDocs = publicNotesSnap.docs;

  if (publicNotesDocs.length > 0) {
    number = publicNotesDocs[0].data().number + 1;
  } else {
    number = 1;
  }

  const newNote = {
    number,
    content,
    createdAt,
  };

  const result = await resumeRef.doc(resumeId).collection("public_notes").add(newNote);
  res.json({ id: result.id, ...newNote });
});

router.delete("/:resumeId/public_notes/:noteId", checkWriteDataAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  const noteId = req.params.noteId;

  const resumeRef = db.collection("resumes");
  const noteRef = resumeRef.doc(resumeId).collection("public_notes").doc(noteId);

  await noteRef.delete();

  res.json({ message: "Note deleted" });
});

module.exports = router;
