const bcrypt = require("bcryptjs");
const User = require("../schemas/userSchema");

const authHandler = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");

// remove password
const sanitizeUser = (user) => {
  const { password, refreshToken, ...rest } = user.toJSON();
  return rest;
};

// ================= REGISTER =================
exports.register = async (req, res, next) => {

  try {

    const { email, password, name, phone } = req.body;

    // kiểm tra email tồn tại
    const exist = await User.findOne({
      where: { email }
    });

    if (exist) {
      return responseHandler.error(res, "Email đã tồn tại", 400);
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
      "User đăng ký thành công"
    );

  } catch (err) {
    next(err);
  }

};


// ================= LOGIN =================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return responseHandler.error(res, "Không tìm thấy người dùng", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return responseHandler.error(res, "Mật khẩu không đúng", 401);
    }

    const accessToken = authHandler.generateAccessToken(user);
    const refreshToken = authHandler.generateRefreshToken(user);

    // lưu refresh token
    await user.update({ refreshToken });

    return responseHandler.success(
      res,
      {
        token: accessToken,
        refreshToken: refreshToken,
        user: sanitizeUser(user)
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
      return responseHandler.error(res, "Refresh token không được cung cấp", 400);
    }

    const user = await User.findOne({
      where: { refreshToken }
    });

    if (!user) {
      return responseHandler.error(res, "Refresh token không hợp lệ", 403);
    }

    const accessToken = authHandler.generateAccessToken(user);

    return responseHandler.success(
      res,
      { accessToken },
      "Access token mới đã được tạo"
    );

  } catch (err) {
    next(err);
  }

};