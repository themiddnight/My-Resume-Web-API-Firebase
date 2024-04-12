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
    if (resumeSummary.active === false) {
      res.status(404).json({ 
        status_code: 404, 
        message: 'Resume not found'
      });
      return;
    }

    // user data
    const userRef = db.collection("users");
    const userSnap = await userRef
      .where('resume_ids', 'array-contains', resumeId)
      .get();
    const userData = userSnap.docs[0].data();
    if (userSnap.empty || userData.verified === false) {
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
    data.profile.title = userData.name;
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

// post: create new resume associated with userId
router.post('/', async (req, res) => {
  const templateData = require('../utils/template_data.json')
  const { userId, resume_name } = req.body;
  
  try {
    // resume doc
    const resumeRef = db.collection("resumes");
    const newResume = {
      user_id: userId,
      resume_name: resume_name,
      active: true
    };
    const resultResume = await resumeRef.add(newResume);

    // resume data docs
    const dataRef = resumeRef.doc(resultResume.id).collection("data");
    for (const key in templateData) {
      await dataRef.doc(key).set(templateData[key]);
    }

    // add resume id to user
    const userRef = db.collection("users");
    const userSnap = await userRef.doc(userId).get();
    const resume_ids = userSnap.data().resume_ids;
    resume_ids.push(resultResume.id);

    const result = await userRef.doc(userId).update({ resume_ids });

    res.status(201).json({
      message: 'Resume created',
      resume_id: resultResume.id
    });

  } catch (error) {
    res.status(500).json({ 
      status_code: 500, 
      message: 'Internal server error',
      error: error
    });
    return;
  }
});

// patch: update active or resume_name
router.patch('/:resumeId', async (req, res) => {
  const resumeId = req.params.resumeId;
  const { active, resume_name } = req.body;
  
  try {
    const resumeRef = db.collection("resumes");
    const docRef = resumeRef.doc(resumeId);
    const data = {};
    if (active !== undefined) {
      data.active = active;
    }
    if (resume_name !== undefined) {
      data.resume_name = resume_name;
    }
    await docRef.update(data);

    res.status(200).json({
      message: 'Resume data updated'
    });

  } catch (error) {
    res.status(500).json({ 
      status_code: 500, 
      message: 'Internal server error',
      error: error
    });
    return;
  }
});

// delete resume
router.delete('/:resumeId', async (req, res) => {
  const resumeId = req.params.resumeId;
  
  try {
    const resumeRef = db.collection("resumes");
    await resumeRef.doc(resumeId).delete();

    res.json({ 
      message: 'Resume deleted'
    });

  } catch (error) {
    res.status(500).json({ 
      status_code: 500, 
      message: 'Internal server error',
      error: error
    });
    return;
  }
});

module.exports = router;