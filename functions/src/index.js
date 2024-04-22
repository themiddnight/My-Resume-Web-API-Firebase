// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const serviceAccount = require('../config/serviceAccount.json');
const config = require('../config/config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: config.storageBucket
});

const { checkAuth } = require('./utils/middleware');

const app = express();

// Trust first proxy
app.set("trust proxy", 1);

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120, // 120 requests
    legacyHeaders: false,
    message: "You have exceeded the 60 requests in 1 minute limit!",
    validate: { ip: false }
  })
);

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status_code: 500, 
    message: "Internal server error",
    error: err
  });
});

// require('./utils/setData').setExampleData();
// emulate slow network
// app.use(async (req, res, next) => {
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   next();
// });

// routes
app.use('/v1/auth', require('./routes/auth.routes'));
app.use('/v1/user', checkAuth, require('./routes/user.routes'));
app.use('/v1/resume', require('./routes/resume.routes'));
app.use('/v1/public_notes', require('./routes/publicNotes.routes'));

app.use('/v1/edit', checkAuth, require('./routes/edit/editProfile.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editAbout.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editExperiences.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editEducation.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editProjects.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editSkills.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editCollections.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editLanguages.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editCertifications.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editOtherLinks.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editPublicNotes.routes'));
app.use('/v1/edit', checkAuth, require('./routes/edit/editSettings.routes'));


exports.app = onRequest(app);
