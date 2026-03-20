const express = require("express");
const router = express.Router();

const dishController = require("../controllers/dishController");
const { verifyToken, requireRole } = require("../utils/authMiddleware");

// ===== ADMIN =====
router.post("/", verifyToken, requireRole("ADMIN"), dishController.createDish);
router.put("/:id", verifyToken, requireRole("ADMIN"), dishController.updateDish);
router.delete("/:id", verifyToken, requireRole("ADMIN"), dishController.deleteDish);
router.patch("/:id/status", verifyToken, requireRole("ADMIN"), dishController.updateDishStatus);

// ===== PUBLIC =====
router.get("/", dishController.getAllDishes);
router.get("/status/:status", dishController.getDishesByStatus);
router.get("/category/:categoryId", dishController.getDishesByCategory);
router.get("/search", dishController.searchDishesByName);
router.get("/:id", dishController.getDishById);

module.exports = router;