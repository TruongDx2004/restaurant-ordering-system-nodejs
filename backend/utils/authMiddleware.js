const jwt = require("jsonwebtoken");
const responseHandler = require("../utils/responseHandler");

const SECRET = "restaurant_secret";

exports.verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return responseHandler.error(res, "Token required", 401);
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;

    next();

  } catch (err) {

    return responseHandler.error(res, "Invalid token", 403);

  }

};

exports.requireRole = (role) => {

  return (req, res, next) => {

    if (req.user.role !== role) {
      return responseHandler.error(res, "Forbidden", 403);
    }

    next();

  };

};