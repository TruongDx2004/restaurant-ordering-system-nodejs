const bcrypt = require("bcryptjs");
const User = require("../schemas/userSchema");

const authHandler = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");


// ================= REGISTER =================
exports.register = async (req, res, next) => {

  try {

    const { email, password, name, phone } = req.body;

    // kiểm tra email tồn tại
    const exist = await User.findOne({
      where: { email }
    });

    if (exist) {
      return responseHandler.error(res, "Email already exists", 400);
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
      name,
      phone,
      role: "EMPLOYEE"
    });

    return responseHandler.success(
      res,
      { id: user.id },
      "User registered successfully"
    );

  } catch (err) {
    next(err);
  }

};


// ================= LOGIN =================
exports.login = async (req, res, next) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return responseHandler.error(res, "User not found", 401);
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return responseHandler.error(res, "Wrong password", 401);
    }

    const accessToken = authHandler.generateAccessToken(user);
    const refreshToken = authHandler.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return responseHandler.success(
      res,
      {
        accessToken,
        refreshToken
      },
      "Login successful"
    );

  } catch (err) {
    next(err);
  }

};


// ================= REFRESH TOKEN =================
exports.refreshToken = async (req, res, next) => {

  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return responseHandler.error(res, "Refresh token required", 400);
    }

    const user = await User.findOne({
      where: { refreshToken }
    });

    if (!user) {
      return responseHandler.error(res, "Invalid refresh token", 403);
    }

    const accessToken = authHandler.generateAccessToken(user);

    return responseHandler.success(
      res,
      { accessToken },
      "Token refreshed"
    );

  } catch (err) {
    next(err);
  }

};