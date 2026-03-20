const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "restaurant_secret";

// ACCESS TOKEN
exports.generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    SECRET,
    { expiresIn: "1h" }
  );
};

// REFRESH TOKEN
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    SECRET,
    { expiresIn: "7d" }
  );
};

// VERIFY
exports.verify = (token) => {
  return jwt.verify(token, SECRET);
};