const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { verifyToken, requireRole } = require("../utils/authMiddleware");

// ADMIN ONLY
router.post("/", verifyToken, requireRole("ADMIN"), userController.createUser);
router.get("/", verifyToken, requireRole("ADMIN"), userController.getAllUsers);
router.get("/:id", verifyToken, requireRole("ADMIN"), userController.getUserById);
router.put("/:id", verifyToken, requireRole("ADMIN"), userController.updateUser);
router.delete("/:id", verifyToken, requireRole("ADMIN"), userController.deleteUser);

module.exports = router;