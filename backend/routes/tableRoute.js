const express = require("express");
const router = express.Router();

const tableController = require("../controllers/tableController");
const { verifyToken, requireRole } = require("../utils/authMiddleware");

/**
 * =========================
 * ADMIN ONLY
 * =========================
 */

// CREATE TABLE
router.post("/", verifyToken, requireRole("ADMIN"), tableController.createTable);

// UPDATE TABLE
router.put("/:id", verifyToken, requireRole("ADMIN"), tableController.updateTable);

// DELETE TABLE
router.delete("/:id", verifyToken, requireRole("ADMIN"), tableController.deleteTable);

// UPDATE STATUS
router.patch("/:id/status", verifyToken, requireRole("ADMIN", "EMPLOYEE"), tableController.updateTableStatus);


/**
 * =========================
 * AUTHENTICATED USERS (ADMIN + EMPLOYEE)
 * =========================
 */

// GET ALL
router.get("/", verifyToken, tableController.getAllTables);

// GET ACTIVE TABLES
router.get("/active", verifyToken, tableController.getActiveTables);

// GET BY NUMBER
router.get("/number/:tableNumber", verifyToken, tableController.getTableByNumber);

// GET BY STATUS
router.get("/status/:status", verifyToken, tableController.getTablesByStatus);

// GET BY AREA
router.get("/area/:area", verifyToken, tableController.getTablesByArea);

/**
 * PUBLIC
 */

// GET BY ID
router.get("/:id", tableController.getTableById);

module.exports = router;