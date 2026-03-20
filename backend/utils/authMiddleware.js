const responseHandler = require("../utils/responseHandler");
const jwtUtil = require("./authHandler");

exports.verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return responseHandler.error(res, "Token required", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwtUtil.verify(token);
    req.user = decoded;
    next();
  } catch (err) {
    return responseHandler.error(res, "Invalid token", 403);
  }
};

// hỗ trợ nhiều role
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return responseHandler.error(res, "Forbidden", 403);
    }
    next();
  };
};