const User = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");

module.exports = {
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

  UpdateRefreshToken: async function (userId, refreshToken) {
    return await User.update(
      { refreshToken: refreshToken },
      { where: { id: userId } }
    );
  },

  GetUserByRefreshToken: async function (refreshToken) {
    return await User.findOne({ where: { refreshToken } });
  }
};
