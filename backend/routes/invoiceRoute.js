const express = require("express");
const router = express.Router();

const controller = require("../controllers/invoiceController");
const { verifyToken, requireRole } = require("../utils/authMiddleware");

// ================= PUBLIC =================
// khách (có hoặc không login) đều tạo được
router.post("/", controller.createInvoice);

// ================= AUTH =================
// nhân viên + admin
router.get("/", verifyToken, controller.getAllInvoices);
router.get("/status/:status", verifyToken, controller.getInvoicesByStatus);
router.get("/table/:tableId", verifyToken, controller.getInvoicesByTable);
router.get("/date-range", verifyToken, controller.getInvoicesByDateRange);
router.get("/table/:tableId/active", verifyToken, controller.getActiveInvoiceByTable);
router.get("/:id/calculate-total", verifyToken, controller.calculateInvoiceTotal);
router.get("/:id", verifyToken, controller.getInvoiceById);

// ================= ADMIN =================
router.put("/:id", verifyToken, requireRole("ADMIN"), controller.updateInvoice);
router.delete("/:id", verifyToken, requireRole("ADMIN"), controller.deleteInvoice);
router.patch("/:id/status", verifyToken, requireRole("ADMIN"), controller.updateInvoiceStatus);

module.exports = router;