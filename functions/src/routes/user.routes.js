const express = require('express');
const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const emailTemplate = require('../utils/emailTemplate');

const router = express.Router();
const db = getFirestore();
const bucket = getStorage().bucket();
const secret = process.env.JWT_SECRET;

const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// get user data (name, email, resume_ids)
router.get('/', async (req, res, next) => {
  const userId = req.user_id;

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
    const resumeRef = db.collection("resumes");
    const resumeSnap = await resumeRef
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();
    userData.resumes = resumeSnap.docs.map(doc => {
      const data = doc.data();
      return {
        resume_id: doc.id,
        active: data.active,
        resume_name: data.resume_name,
      };
    });

    res.json(userData);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      message: 'Internal server error',
      error: error
    });
  }
});


// update name
router.post('/name', async (req, res) => {
  const userId = req.user_id
  const name = req.body.name;
  
  if (typeof name !== 'string' || name.length < 1) {
    res.status(400).json({
      status_code: 400,
      message: 'Invalid name'
    });
    return;
  }

  try {
    const userRef = db.collection("users");
    await userRef.doc(userId).update({ name });
    res.json({ message: 'Name updated' });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      message: 'Internal server error',
      error: error
    });
    return;
  }
});


// update email. doesn't update email directly, send verification email
router.post('/email', async (req, res) => {
  const userId = req.user_id
  const email = req.body.email;
  const originalEmail = req.body.original_email;
  
  if (typeof email !== 'string' || email.length < 1) {
    res.status(400).json({
      status_code: 400,
      message: 'Invalid email'
    });
    return;
  }

  // check if email is already in use
  const userRef = db.collection("users");
  const userSnap = await userRef.where('email', '==', email).get();
  if (!userSnap.empty) {
    res.status(409).json({
      status_code: 409,
      message: 'Email already in use'
    });
    return;
  }

  try {
    // prepare email token and options
    const token = jwt.sign(
      { user_id: userId, email }, 
      secret, 
      { expiresIn: '1h' }
    );

    const oldMailOptions = {
      from: `My Resume Web - themiddnight.github.io <${process.env.EMAIL_USER}>`,
      to: originalEmail,
      subject: 'Your email has been changed',
      html: emailTemplate(
        'Your email has been changed',
        `Hello!`,
        `<p>Your changing email request has been received. If you did not change your email and still have access to your account, please reset your password immediately.</p>
        <p>If you cannot access your account, please contact us immediately.</p><br>
        <p>Thank you</p>
        <p>Pathompong Thitithan - My Resume Web</p>`
      )
    };

    const newMailOptions = {
      from: `My Resume Web - themiddnight.github.io <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your changed email',
      html: emailTemplate(
        'Verify your email',
        `Hello!`,
        `<p>Your changing email request has been received. Please verify your email by clicking the link below.</p>
        <p>If you did not change your email, please ignore this email.</p><br>
        <p>Click the link to confirm your email:
          <a href="${process.env.FRONTEND_URL}/#/verify-email/${token}">
            Click here
          </a>
        </p><br>
        <p>Thank you</p>
        <p>Pathompong Thitithan - My Resume Web</p>`
      )
    };

    // send emai
    const sendMailPromises = [
      transporter.sendMail(oldMailOptions),
      transporter.sendMail(newMailOptions)
    ];
    await Promise.all(sendMailPromises);
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      message: 'Internal server error',
      error: error
    });
  }
});


// delete user and all data
router.delete('/', async (req, res) => {
  const userId = req.user_id;
  const password = req.body.password;
  console.log(req.body)
  console.log(typeof req.body)
  
  try {
    // check password
    const userRef = db.collection("users");
    const userSnap = await userRef.doc(userId).get();
    const userData = userSnap.data();
    const isPasswordMatch = await bcrypt.compare(password, userData.password);
    if (!isPasswordMatch) {
      res.status(401).json({
        status_code: 401,
        message: 'Incorrect password'
      });
      return;
    }

    await userRef.doc(userId).delete();

    const resumeRef = db.collection("resumes");
    const resumeSnap = await resumeRef.where('user_id', '==', userId).get();
    // delete all resumes data and subcollections, and storage files with path: resumes/{resume_id}
    const deleteResumePromises = resumeSnap.docs.map(async doc => {
      const resumeId = doc.id;
      const dataRef = resumeRef.doc(resumeId).collection("data");
      const dataSnap = await dataRef.get();
      const deleteDataPromises = dataSnap.docs.map(async doc => {
        await dataRef.doc(doc.id).delete();
        await bucket.deleteFiles({ prefix: `resumes/${resumeId}` });
      });
      await Promise.all(deleteDataPromises);
      await resumeRef.doc(resumeId).delete();
    });
    await Promise.all(deleteResumePromises);
  
    res.json({ message: 'User deleted' });
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