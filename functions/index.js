// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const {onRequest} = require("firebase-functions/v2/https");
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// import routes
const getAllDataRoute = require('./routes/getAllData.route');
const publicNotesRoute = require('./routes/publicNotes.route');
const pageConfigRoute = require('./routes/pageConfig.route');

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.static("public"));

app.use(helmet({
  frameguard: {
    action: "deny"
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'"]
    }
  },
  dnsPrefetchControl: false
}));

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests
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

// routes
app.use('/api', getAllDataRoute);
app.use('/api', publicNotesRoute);
app.use('/api', pageConfigRoute);

app.get("/", (req, res) => {
  res.render("index", {name: "Pathompong Thitithan"});
})

exports.app = onRequest(app);
