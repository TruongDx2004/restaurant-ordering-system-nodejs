const express = require("express");
const router = express.Router();

const controller = require("../controllers/invoiceItemController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { validate, invoiceItemValidator } = require("../utils/validateHandler");

// ===== CREATE =====
router.post("/", invoiceItemValidator.create, validate, controller.createInvoiceItem);
router.post("/add-to-invoice", invoiceItemValidator.addItem, validate, controller.addItemToInvoice);

// ===== GET =====
router.get("/", checkLogin, controller.getAllInvoiceItems);
router.get("/invoice/:invoiceId", checkLogin, invoiceItemValidator.getByInvoice, validate, controller.getInvoiceItemsByInvoice);
router.get("/dish/:dishId", checkLogin, invoiceItemValidator.getByDish, validate, controller.getInvoiceItemsByDish);
router.get("/:id", checkLogin, invoiceItemValidator.getById, validate, controller.getInvoiceItemById);

// ===== UPDATE =====
router.put("/:id", checkLogin, invoiceItemValidator.update, validate, controller.updateInvoiceItem);
router.patch("/:id/quantity", invoiceItemValidator.updateQuantity, validate, controller.updateQuantity);
router.patch("/:id/status", checkLogin, invoiceItemValidator.updateStatus, validate, controller.updateStatus);

// ===== DELETE =====
router.delete("/:id", checkLogin, checkRole("ADMIN"), invoiceItemValidator.delete, validate, controller.deleteInvoiceItem);

module.exports = router;