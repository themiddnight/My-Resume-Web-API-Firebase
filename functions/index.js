// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

initializeApp();

require('./utils/setTemplateData').setExampleData();
require('./utils/setTemplateData').setTemplateData();

// import routes
const viewRoutes = require('./routes/view.routes');
const getAllDataRoute = require('./routes/getAllData.routes');
const publicNotesRoute = require('./routes/publicNotes.routes');

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.referrerPolicy({ policy: "same-origin" }));
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));


app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120, // 120 requests
    legacyHeaders: false,
    message: "You have exceeded the 60 requests in 1 minute limit!",
    validate: { ip: false }
  })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
})

// View engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Trust first proxy
app.set("trust proxy", 1);

// data routes
app.use('/api', getAllDataRoute);
app.use('/api', publicNotesRoute);

// edit page routes
app.use('/edit', viewRoutes);

exports.app = onRequest(app);
