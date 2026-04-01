const express = require("express");
const router = express.Router();

const dishController = require("../controllers/dishController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { validate, dishValidator } = require("../utils/validateHandler");
const upload = require("../utils/upload");

// ===== ADMIN =====
router.post("/", checkLogin, checkRole("ADMIN"), upload.single("image"), dishValidator.create, validate, dishController.createDish);
router.put("/:id", checkLogin, checkRole("ADMIN"), upload.single("image"), dishValidator.update, validate, dishController.updateDish);
router.delete("/:id", checkLogin, checkRole("ADMIN"), dishValidator.delete, validate, dishController.deleteDish);
router.patch("/:id/status", checkLogin, checkRole("ADMIN"), dishValidator.updateStatus, validate, dishController.updateDishStatus);

// ===== PUBLIC =====
router.get("/", dishController.getAllDishes);
router.get("/status/:status", dishController.getDishesByStatus);
router.get("/category/:categoryId", dishController.getDishesByCategory);
router.get("/search", dishController.searchDishesByName);
router.get("/:id", dishController.getDishById);

module.exports = router;