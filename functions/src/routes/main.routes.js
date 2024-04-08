const express = require('express');
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();

// get all resume data
router.get('/:resumeId/data', async (req, res) => {
  const resumeId = req.params.resumeId;
  
  try {  
    const resumeRef = db.collection("resumes");
    // resume data
    const dataSnap = await resumeRef
      .doc(resumeId)
      .collection("data")
      .get()
    const dataDocs = dataSnap.docs;
    if (dataDocs.length === 0) {
      res.status(404).json({ 
        status_code: 404, 
        message: 'Resume not found'
      });
      return;
    }

    // resume summary
    const docSnap = await resumeRef
      .doc(resumeId)
      .get();
    const resumeSummary = docSnap.data();

    // user data
    const userRef = db.collection("users");
    const userSnap = await userRef
      .where('resume_ids', 'array-contains', resumeId)
      .get();
    const userDocs = userSnap.docs;
    if (userDocs.length === 0) {
      res.status(404).json({ 
        status_code: 404, 
        message: 'User not found'
      });
      return;
    }

    // create data object
    const data = {};
    dataDocs.forEach((doc) => {
      data[doc.id] = doc.data();
    });

    // add user name and summary to resume data
    data.profile.title = userSnap.docs[0].data().name;
    data.summary = resumeSummary;

    res.json(data);

  } catch (error) {
    res.status(500).json({ 
      status_code: 500, 
      message: 'Internal server error',
      error: error
    });
    return;
  }
});

// get summary resume data (owner name, resume name, active data)
router.get('/:resumeId/summary', async (req, res) => {
  const resumeId = req.params.resumeId;
  
  try {
    // get resume owner info
    const userRef = db.collection("users");
    const userSnap = await userRef
      .where('resume_ids', 'array-contains', resumeId)
      .get();
    if (userSnap.empty) {
      res.status(404).json({ 
        status_code: 404, 
        message: 'User not found'
      });
      return;
    }
    const resumeRef = db.collection("resumes");
    // resume doc data
    const docSnap = await resumeRef
      .doc(resumeId)
      .get();
    if (!docSnap.exists) {
      res.status(404).json({ 
        status_code: 404, 
        message: 'Resume not found',
      });
      return;
    }
    // resume data
    const dataSnap = await resumeRef
      .doc(resumeId)
      .collection("data")
      .get()
    const dataDocs = dataSnap.docs;

    // const summary = { ...docSnap.data(), data_active: {} };
    const summary = { 
      owner: userSnap.docs[0].data().name, 
      ...docSnap.data(), 
      data_active: {} 
    };

    dataDocs.forEach((doc) => {
      const data = doc.data();
      summary.data_active[doc.id] = data.active;
    });

    res.json(summary);

  } catch (error) {
    res.status(500).json({ 
      status_code: 500, 
      message: 'Internal server error',
      error: error
    });
    return;
  }
});


// delete user and all data
router.delete('/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const resumeRef = db.collection("resumes");
    const userRef = db.collection("users");
    await resumeRef.doc(userId).delete();
    await userRef.doc(userId).delete();
  } catch (error) {
    res.status(500).json({ 
      status_code: 500, 
      error: 'Internal server error'
    });
    return;
  }
  
  res.json({ message: 'User deleted' });
});

module.exports = router;