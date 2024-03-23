const express = require('express');
const { getFirestore } = require("firebase-admin/firestore");

const router = express.Router();
const db = getFirestore();

router.get("/profile", async (req, res) => {
  const data = await db.
    collection("resumes").
    doc("example").
    collection("data").
    doc("profile").
    get();
  res.render("./edit/profile", { current: "profile", data: data.data() });
})

router.get("/about", (req, res) => {
  res.render("./edit/about", { current: "about" });
})

router.get("/experiences", (req, res) => {
  res.render("./edit/experiences", { current: "experiences" });
})

module.exports = router;