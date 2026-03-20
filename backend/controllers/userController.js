const User = require("../schemas/userSchema");
const bcrypt = require("bcrypt");
const responseHandler = require("../utils/responseHandler");

// remove password + refreshToken
const sanitizeUser = (user) => {
  const { password, refreshToken, ...rest } = user.toJSON();
  return rest;
};

// ================= CREATE =================
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // check email exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return responseHandler.error(res, "Email already exists", 400);
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role
    });

    return responseHandler.success(
      res,
      sanitizeUser(user),
      "User created successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET BY ID =================
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return responseHandler.error(res, "User not found", 404);
    }

    return responseHandler.success(
      res,
      sanitizeUser(user),
      "User retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET ALL =================
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();

    return responseHandler.success(
      res,
      users.map(sanitizeUser),
      "Users retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= UPDATE =================
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return responseHandler.error(res, "User not found", 404);
    }

    const { email, password, name, phone, role } = req.body;

    // nếu đổi email thì check trùng
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return responseHandler.error(res, "Email already exists", 400);
      }
    }

    // hash password nếu có
    let updatedData = { email, name, phone, role };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updatedData);

    return responseHandler.success(
      res,
      sanitizeUser(user),
      "User updated successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= DELETE =================
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return responseHandler.error(res, "User not found", 404);
    }

    await user.destroy();

    return responseHandler.success(
      res,
      null,
      "User deleted successfully"
    );

  } catch (err) {
    next(err);
  }
};