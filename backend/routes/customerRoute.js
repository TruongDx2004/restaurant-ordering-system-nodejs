const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");

/**
 * PUBLIC API (không cần login)
 */
router.post("/register", customerController.register);
router.post("/login", customerController.login);

module.exports = router;