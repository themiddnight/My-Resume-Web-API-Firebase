const jwt = require('jsonwebtoken');
const { getFirestore } = require("firebase-admin/firestore");

require('dotenv').config();

const db = getFirestore();

const api_key = process.env.FRONTEND_API_KEY;
const secret = process.env.JWT_SECRET;

const checkKey = (req, res, next) => {
  if (req.query.key === api_key) {
    next();
  } else {
    res.status(401).json({
      status_code: res.statusCode,
      message: 'Unauthorized: API key invalid'
    });
  }
}

const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(req.headers)
  try {
    const decoded = jwt.verify(token, secret);
    req.user_id = decoded.user_id;
    next();
  } catch (err) {
    return res.status(401).json({
      status_code: res.statusCode,
      message: "Unauthorized: Invalid token"
    });
  }
}

const checkOwner = async (req, res, next) => {
  const userId = req.user_id;
  const resumeId = req.params.resumeId;
  try {
    // get user data. check if user is the owner of the resume
    const resumeDocRef = db.collection("resumes").doc(resumeId);
    const resumeUserId = (await resumeDocRef.get()).data().user_id;
    if (userId !== resumeUserId) {
      res.status(403).json({
        status_code: 403,
        message: "Forbidden",
      });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({
      status_code: 500,
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  checkKey,
  checkAuth,
  checkOwner
};