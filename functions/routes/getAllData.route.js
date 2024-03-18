const express = require('express');
const { db } = require('../db');

const router = express.Router();

async function getData() {
  const profile = (await db.collection('profile').get()).docs[0].data();
  const about = (await db.collection('about').get()).docs.map(doc => doc.data());
  const experiences = (await db.collection('experiences').orderBy('to', 'desc').get()).docs.map(doc => doc.data());
  const education = (await db.collection('education').orderBy('to', 'desc').get()).docs.map(doc => doc.data());
  const personal_projects = (await db.collection('personal_projects').orderBy('createdAt', 'desc').get()).docs.map(doc => doc.data());
  const skills = (await db.collection('skills').orderBy('order').get()).docs.map(doc => doc.data());
  const tools = (await db.collection('tools').get()).docs.map(doc => doc.data());
  const languages = (await db.collection('languages').get()).docs.map(doc => doc.data());
  const certifications = (await db.collection('certifications').orderBy('issuedDate', 'desc').get()).docs.map(doc => doc.data());
  const other_profiles = (await db.collection('other_profiles').get()).docs.map(doc => doc.data());
  const public_notes = (await db.collection('public_notes').orderBy('createdAt', 'desc').limit(10).get()).docs.map(doc => doc.data());

  return {
      profile,
      about,
      experiences,
      education,
      personal_projects,
      skills,
      tools,
      languages,
      certifications,
      other_profiles,
      public_notes,
  };
}

// Un-cached route
router.get('/data', async (req, res) => {
  res.json(await getData());
});

// Cached route
router.get('/data_cached', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // 5 minutes
  res.json(await getData());
});

module.exports = router;