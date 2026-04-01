const express = require("express");const router = express.Router();

const controller = require("../controllers/invoiceController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { validate, invoiceValidator } = require("../utils/validateHandler");

// ===== PUBLIC =====
router.post("/", invoiceValidator.create, validate, controller.createInvoice);
router.post("/create-with-items", invoiceValidator.createWithItems, validate, controller.createInvoiceWithItems);
router.get("/table-number/:tableNumber/active", invoiceValidator.getActiveByTableNumber, validate, controller.getActiveInvoiceByTableNumber);

// ===== AUTH =====
router.get("/", checkLogin, controller.getAllInvoices);
router.get("/status/:status", checkLogin, invoiceValidator.getByStatus, validate, controller.getInvoicesByStatus);
router.get("/table/:tableId", checkLogin, invoiceValidator.getByTable, validate, controller.getInvoicesByTable);
router.get("/date-range", checkLogin, invoiceValidator.getByDateRange, validate, controller.getInvoicesByDateRange);
router.get("/table/:tableId/active", checkLogin, invoiceValidator.getActiveByTable, validate, controller.getActiveInvoiceByTable);
router.get("/:id/calculate-total", checkLogin, invoiceValidator.calculateTotal, validate, controller.calculateInvoiceTotal);
router.get("/:id", checkLogin, invoiceValidator.getById, validate, controller.getInvoiceById);

// ===== ADMIN =====
router.put("/:id", checkLogin, checkRole("ADMIN"), invoiceValidator.update, validate, controller.updateInvoice);
router.delete("/:id", checkLogin, checkRole("ADMIN"), invoiceValidator.delete, validate, controller.deleteInvoice);
router.patch("/:id/status", checkLogin, checkRole("ADMIN"), invoiceValidator.updateStatus, validate, controller.updateInvoiceStatus);

module.exports = router;