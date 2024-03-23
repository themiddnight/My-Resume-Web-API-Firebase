const express = require('express');
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();

router.get('/:userId/data', async (req, res) => {
  const userId = req.params.userId;
  const { cache } = req.query;
  let dataDocs;
  
  try {  
    const resumeRef = db.collection("resumes");
    const dataSnap = await resumeRef
      .doc(userId)
      .collection("data")
      .get();
    dataDocs = dataSnap.docs;
  } catch (error) {
    res.status(500).send('Error getting data');
    return;
  }
  
  if (dataDocs.length === 0) {
    res.status(404).send('Data not found');
    return;
  }

  const data = {};
  dataDocs.forEach((doc) => {
    data[doc.id] = doc.data();
  });

  if (cache === 'true') {
    res.set('Cache-Control', 'public, max-age=1800, s-maxage=3600'); // 30 minutes
  }
  res.json(data);
});

module.exports = router;