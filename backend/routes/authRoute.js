const express = require("express");
const router = express.Router();

const controller = require("../controllers/authController");
const { validate, authValidator } = require("../utils/validateHandler");

router.post("/register", authValidator.register, validate, controller.register);
router.post("/login", authValidator.login, validate, controller.login);
router.post("/refresh-token", authValidator.refreshToken, validate, controller.refreshToken);

module.exports = router;