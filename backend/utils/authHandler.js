const jwt = require("jsonwebtoken");

const SECRET = "restaurant_secret";

exports.generateAccessToken = (user) => {

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    SECRET,
    { expiresIn: "1h" }
  );

};

exports.generateRefreshToken = (user) => {

  return jwt.sign(
    { id: user.id },
    SECRET,
    { expiresIn: "7d" }
  );

};