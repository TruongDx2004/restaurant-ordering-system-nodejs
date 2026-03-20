const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const { verifyToken, requireRole } = require("../utils/authMiddleware");

// ===== ADMIN ONLY =====
router.post("/", verifyToken, requireRole("ADMIN"), categoryController.createCategory);

router.put("/:id", verifyToken, requireRole("ADMIN"), categoryController.updateCategory);

router.delete("/:id", verifyToken, requireRole("ADMIN"), categoryController.deleteCategory);

// ===== AUTHENTICATED =====
router.get("/", categoryController.getAllCategories);

router.get("/name/:name", categoryController.getCategoryByName);

router.get("/:id", categoryController.getCategoryById);

module.exports = router;