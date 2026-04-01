const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { validate, categoryValidator } = require("../utils/validateHandler");

// ===== ADMIN =====
router.post("/", checkLogin, checkRole("ADMIN"), categoryValidator.create, validate, categoryController.createCategory);

router.put("/:id", checkLogin, checkRole("ADMIN"), categoryValidator.update, validate, categoryController.updateCategory);

router.delete("/:id", checkLogin, checkRole("ADMIN"), categoryValidator.delete, validate, categoryController.deleteCategory);

// ===== PUBLIC =====
router.get("/:id", categoryValidator.getById, validate, categoryController.getCategoryById);

router.get("/name/:name", categoryValidator.getByName, validate, categoryController.getCategoryByName);

router.get("/", categoryController.getAllCategories);

module.exports = router;