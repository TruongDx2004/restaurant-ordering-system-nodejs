const User = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");

module.exports = {
  // Logic đăng ký
  Register: async function (email, password, name, phone) {
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hash,
      name,
      phone,
      role: "EMPLOYEE"
    });
    return newUser;
  },

  // Logic đăng nhập
  Login: async function (email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Mật khẩu không đúng");
    }

    return user;
  },

  // Cập nhật Refresh Token
  UpdateRefreshToken: async function (userId, refreshToken) {
    return await User.update(
      { refreshToken: refreshToken },
      { where: { id: userId } }
    );
  },

  // Lấy người dùng qua Refresh Token
  GetUserByRefreshToken: async function (refreshToken) {
    return await User.findOne({ where: { refreshToken } });
  }
};
