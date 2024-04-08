const express = require('express');
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();

router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;