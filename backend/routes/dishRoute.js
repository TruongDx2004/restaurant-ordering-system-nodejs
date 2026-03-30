const express = require("express");
const router = express.Router();

const dishController = require("../controllers/dishController");
const { verifyToken, requireRole } = require("../utils/authMiddleware");
const upload = require("../utils/upload");

// ===== ADMIN =====
router.post("/", verifyToken, requireRole("ADMIN"), upload.single("image"), dishController.createDish);
router.put("/:id", verifyToken, requireRole("ADMIN"), upload.single("image"), dishController.updateDish);
router.delete("/:id", verifyToken, requireRole("ADMIN"), dishController.deleteDish);
router.patch("/:id/status", verifyToken, requireRole("ADMIN"), dishController.updateDishStatus);

// ===== PUBLIC =====
router.get("/", dishController.getAllDishes);
router.get("/status/:status", dishController.getDishesByStatus);
router.get("/category/:categoryId", dishController.getDishesByCategory);
router.get("/search", dishController.searchDishesByName);
router.get("/:id", dishController.getDishById);

module.exports = router;