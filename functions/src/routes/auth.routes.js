const express = require('express');
const { getFirestore } = require("firebase-admin/firestore");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');

const emailTemplate = require('../utils/emailTemplate');

const router = express.Router();
const db = getFirestore();
const secret = process.env.JWT_SECRET;
const saltRounds = process.env.SALT_ROUNDS;

const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendVerificationEmail(name, email, user_id) {
  const emailToken = jwt.sign(
    { user_id, email }, 
    secret, 
    { expiresIn: '1h' }
  );

  const mailOptions = {
    from: `My Resume Web - themiddnight.github.io <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email',
    html: emailTemplate(
      'Verify your email',
      `Hi! ${name}`,
      `<p>Thank you for registering. Please verify your email by clicking the link below.</p>
      <p>If you did not register, please ignore this email.</p><br>
      <p>Click the link to confirm your email:
        <a href="${process.env.FRONTEND_URL}/#/verify-email/${emailToken}">
          Click here
        </a>
      </p><br>
      <p>Thank you</p>
      <p>Pathompong Thitithan - My Resume Web</p>`
    )
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
}


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      message: "Invalid data",
    });
  }

  // check if email exists in the database
  const userRef = db.collection("users");
  const userSnap = await userRef.where('email', '==', email).get();
  if (userSnap.empty) {
    return res.status(404).json({
      message: "Email not found",
    });
  }

  // check if password matches
  const userData = userSnap.docs[0].data();
  if (!bcrypt.compareSync(password, userData.password)) {
    return res.status(401).json({
      message: "Email or password is incorrect",
    });
  }

  // create token
  const token = jwt.sign(
    { user_id: userSnap.docs[0].id }, 
    secret, 
    { expiresIn: '1d' }
  );
  
  res.json({ token });
});


router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Invalid data",
    });
  }

  // check if email exists in the database
  const userRef = db.collection("users");
  const userSnap = await userRef.where('email', '==', email).get();
  if (!userSnap.empty) {
    return res.status(409).json({
      message: "Email already exists",
    });
  }

  // hash password
  const hash = bcrypt.hashSync(password, parseInt(saltRounds));
  // create user
  const userData = {
    name,
    email,
    password: hash,
    verified: false,
  };
  const userDoc = await userRef.add(userData);

  try {
    await sendVerificationEmail(name, email, userDoc.id);
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});


// send new verification email
router.post('/send-verification-email', async (req, res) => {
  const email = req.body.email;

  // check if email exists in the database
  const userRef = db.collection("users");
  const userSnap = await userRef.where('email', '==', email).get();
  if (userSnap.empty) {
    return res.status(404).json({
      message: "Email not found",
    });
  }

  const userData = userSnap.docs[0].data();
  if (userData.verified) {
    return res.status(400).json({
      message: "Email already verified",
    });
  }

  try {
    await sendVerificationEmail(userData.name, email, userSnap.docs[0].id);
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});


// reset password. doesn't update password directly, send reset password email
router.post('/send-reset-password', async (req, res) => {
  const email = req.body.email;

  // check if email exists in the database
  const userRef = db.collection("users");
  const userSnap = await userRef.where('email', '==', email).get();
  if (userSnap.empty) {
    return res.status(404).json({
      message: "Email not found",
    });
  }

  const userData = userSnap.docs[0].data();
  const name = userData.name;

  try {
    // prepare email token and options
    const token = jwt.sign(
      { user_id: userSnap.docs[0].id }, 
      secret, 
      { expiresIn: '1h' }
    );

    const mailOptions = {
      from: `My Resume Web - themiddnight.github.io <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: emailTemplate(
        'Reset your password',
        `Hi! ${name}`,
        `<p>Your password reset request has been received. Please reset your password by clicking the link below.</p>
        <p>If you did not reset your password, please ignore this email.</p><br>
        <p>Click the link to reset your password:
          <a href="${process.env.FRONTEND_URL}/#/reset-password/${token}?email=${email}">
            Click here
          </a>
        </p><br>
        <p>Thank you</p>
        <p>Pathompong Thitithan - My Resume Web</p>`
      )
    };

    // send email
    const result = await transporter.sendMail(mailOptions);
    res.json({ message: 'Reset password email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      message: 'Internal server error',
      error: error
    });
  }
})


// verify email (from email link)
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, secret);
    const userRef = db.collection("users");
    await userRef.doc(decoded.user_id).update({ email: decoded.email, verified: true });

    res.json({ message: 'Email verified' });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Invalid token",
    });
  }
});


// reset password (from email link)
router.post('/reset-password/', async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, secret);
    const hash = bcrypt.hashSync(password, parseInt(saltRounds));
    const userRef = db.collection("users");
    await userRef.doc(decoded.user_id).update({ password: hash });

    res.json({ message: 'Password reset' });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Invalid token",
    });
  }
});


module.exports = router;