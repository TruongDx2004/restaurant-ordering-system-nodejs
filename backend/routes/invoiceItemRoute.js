const express = require("express");
const router = express.Router();

const controller = require("../controllers/invoiceItemController");
const { verifyToken, requireRole } = require("../utils/authMiddleware");

// ===== CREATE =====
router.post("/", controller.createInvoiceItem);
router.post("/add-to-invoice", controller.addItemToInvoice);

// ===== GET =====
router.get("/", verifyToken, controller.getAllInvoiceItems);
router.get("/invoice/:invoiceId", verifyToken, controller.getInvoiceItemsByInvoice);
router.get("/dish/:dishId", verifyToken, controller.getInvoiceItemsByDish);
router.get("/:id", verifyToken, controller.getInvoiceItemById);

// ===== UPDATE =====
router.put("/:id", verifyToken, controller.updateInvoiceItem);
router.patch("/:id/quantity", controller.updateQuantity);
router.patch("/:id/status", verifyToken, controller.updateStatus);

// ===== DELETE =====
router.delete("/:id", verifyToken, requireRole("ADMIN"), controller.deleteInvoiceItem);

module.exports = router;