require('dotenv').config();

const api_key = process.env.API_KEY;

const checkWriteDataAuth = (req, res, next) => {
  if (req.headers.authorization === `Bearer ${api_key}`) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

module.exports = {
  checkWriteDataAuth
};