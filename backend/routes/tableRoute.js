const express = require("express");
const router = express.Router();

const controller = require("../controllers/tableController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { tableValidator, validate } = require("../utils/validateHandler");

router.post("/", checkLogin, checkRole("ADMIN"), tableValidator.create, validate, controller.createTable);
router.put("/:id", checkLogin, checkRole("ADMIN"), tableValidator.update, validate, controller.updateTable);
router.delete("/:id", checkLogin, checkRole("ADMIN"), tableValidator.idParam, validate, controller.deleteTable);
router.patch("/:id/status", checkLogin, checkRole("ADMIN", "EMPLOYEE"), tableValidator.updateStatus, validate, controller.updateTableStatus);

router.get("/", checkLogin, controller.getAllTables);
router.get("/active", checkLogin, controller.getActiveTables);
router.get("/number/:tableNumber", checkLogin, tableValidator.tableNumberParam, validate, controller.getTableByNumber);
router.get("/status/:status", checkLogin, tableValidator.statusParam, validate, controller.getTablesByStatus);
router.get("/area/:area", checkLogin, tableValidator.areaParam, validate, controller.getTablesByArea);

router.get("/:id", tableValidator.idParam, validate, controller.getTableById);

module.exports = router;