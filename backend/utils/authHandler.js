const jwt = require("jsonwebtoken");

const SECRET = "restaurant_secret";

// ACCESS TOKEN
exports.generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    SECRET,
    { expiresIn: "6h" }
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

exports.checkLogin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Không có token được cung cấp" });
    }
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Có lỗi xảy ra khi xác thực" });
  }
};

exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ message: "Bạn không có quyền truy cập chức năng này" });
    }
    next();
  };
};