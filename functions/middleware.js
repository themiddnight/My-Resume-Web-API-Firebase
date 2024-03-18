const checkWriteDataAuth = (req, res, next) => {
  if (req.headers.authorization === "Bearer 123456789") {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

module.exports = {
  checkWriteDataAuth
};