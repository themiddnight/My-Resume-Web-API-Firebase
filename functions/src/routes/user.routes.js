const express = require('express');
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();

// get user data (name, email, resume_ids)
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // get user data
    const userRef = db.collection("users");
    const userSnap = await userRef.doc(userId).get();
    if (!userSnap.exists) {
      res.status(404).json({
        status_code: 404,
        message: 'User not found'
      });
      return;
    }
    const userData = userSnap.data();
    delete userData.password;

    // get associated resumes
    const resumePromises = userData.resume_ids.map(async (resumeId) => {
      const resumeRef = db.collection("resumes");
      const resumeSnap = await resumeRef.doc(resumeId).get();
      const data = resumeSnap.data();
      return {
        resume_id: resumeSnap.id,
        active: data.active,
        resume_name: data.resume_name,
        user_id: data.user_id
      };
    });
    userData.resumes = await Promise.all(resumePromises);

    res.json(userData);

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
      message: 'Internal server error',
      error: error
    });
    return;
  }
  
  res.json({ message: 'User deleted' });
});

module.exports = router;