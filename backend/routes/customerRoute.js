const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");
const { validate, customerValidator } = require("../utils/validateHandler");

router.post("/register", customerValidator.register, validate, customerController.register);
router.post("/login", customerValidator.login, validate, customerController.login);

module.exports = router;