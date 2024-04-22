const express = require('express');
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const { checkKey, checkAuth, checkOwner } = require('../utils/middleware');

const router = express.Router();
const db = getFirestore();
const bucket = getStorage().bucket();

// get all resume data
router.get('/:resumeId', checkKey, async (req, res) => {
  const resumeId = req.params.resumeId;
  
  try {  
    const resumeRef = db.collection("resumes");

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
    const resumeUserId = resumeSummary.user_id;
    const userSnap = await userRef.doc(resumeUserId).get();
    const userData = userSnap.data();
    if (!userData || userData.verified === false) {
      res.status(404).json({
        status_code: 404,
        message: 'User not found'
      });
      return;
    }

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
    console.error(error);
    res.status(500).json({ 
      status_code: 500, 
      message: 'Internal server error',
      error: error
    });
    return;
  }
});

// get summary resume data (owner name, resume name, active data)
router.get('/:resumeId/summary', checkAuth, checkOwner, async (req, res) => {
  const resumeId = req.params.resumeId;
  
  try {
    const resumeRef = db.collection("resumes");

    // resume doc data
    const resumeDocSnap = await resumeRef
      .doc(resumeId)
      .get();
    if (!resumeDocSnap.exists) {
      res.status(404).json({ 
        status_code: 404, 
        message: 'Resume not found',
      });
      return;
    }
    // resume data
    const resuemDataSnap = await resumeRef
      .doc(resumeId)
      .collection("data")
      .get()
    const resumeDataDocs = resuemDataSnap.docs;

    // find user data
    const userId = resumeDocSnap.data().user_id;
    const userRef = db.collection("users");
    const userSnap = await userRef.doc(userId).get();
    if (!userSnap.exists) {
      res.status(404).json({
        status_code: 404,
        message: 'User not found'
      });
      return;
    }

    const summary = { 
      owner: userSnap.data().name,
      ...resumeDocSnap.data(), 
      data_active: {} 
    };

    resumeDataDocs.forEach((doc) => {
      const data = doc.data();
      summary.data_active[doc.id] = data.active;
    });

    res.json(summary);

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status_code: 500, 
      message: 'Internal server error',
      error: error
    });
    return;
  }
});

// post: create new resume associated with userId
router.post('/', checkAuth, async (req, res) => {
  const templateData = require('../utils/template_data.json')
  const userId = req.user_id;
  const resume_name = req.body.resume_name;
  let resume_id = req.body.resume_id;
  let resultResume;

  // check user verified
  const userRef = db.collection("users");
  const userSnap = await userRef.doc(userId).get();
  const userData = userSnap.data();
  if (!userData || userData.verified === false) {
    res.status(404).json({
      status_code: 404,
      message: 'User not found'
    });
    return;
  }
  
  try {
    // resume doc
    const resumeRef = db.collection("resumes");
    const newResume = {
      user_id: userId,
      resume_name: resume_name,
      active: true,
      created_at: new Date()
    };
    if (resume_id) {
      resume_id = resume_id.replace(/\s/g, '');
      const resumeDocSnap = await resumeRef.doc(resume_id).get();
      if (resumeDocSnap.exists) {
        res.status(400).json({
          status_code: 400,
          message: 'This resume ID has been used. Please use another ID.'
        });
        return;
      }
      await resumeRef.doc(resume_id).set(newResume);
      resultResume = resume_id;
    } else {
      const result = await resumeRef.add(newResume);
      resultResume = result.id;
    }

    // resume data docs
    const dataRef = resumeRef.doc(resultResume).collection("data");
    for (const key in templateData) {
      await dataRef.doc(key).set(templateData[key]);
    }

    res.status(201).json({
      message: 'Resume created',
      resume_id: resume_id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status_code: 500, 
      message: 'Internal server error',
      error: error
    });
    return;
  }
});

// patch: update active or resume_name
router.patch('/:resumeId', checkAuth, async (req, res) => {
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
router.delete('/:resumeId', checkAuth, async (req, res) => {
  const resumeId = req.params.resumeId;
  
  try {
    const resumeRef = db.collection("resumes");
    // delete subcollection data
    await resumeRef
      .doc(resumeId)
      .collection("data")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          doc.ref.delete();
        });
      });
    // delete resume doc
    await resumeRef.doc(resumeId).delete();

    // delete storage
    await bucket.deleteFiles({
      prefix: `resumes/${resumeId}/`
    });

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