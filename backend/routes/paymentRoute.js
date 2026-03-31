const express = require("express");
const router = express.Router();

const controller = require("../controllers/paymentController");
const { verifyToken, requireRole } = require("../utils/authMiddleware");
const momo = require("../config/momo");

/**
 * ADMIN
 */
router.post("/", verifyToken, requireRole("ADMIN"), controller.createPayment);
router.put("/:id", verifyToken, requireRole("ADMIN"), controller.updatePayment);
router.delete("/:id", verifyToken, requireRole("ADMIN"), controller.deletePayment);

/**
 * AUTH USER
 */
router.get("/", verifyToken, controller.getAllPayments);
router.get("/:id", verifyToken, controller.getPaymentById);

router.get("/invoice/:invoiceId", verifyToken, controller.getPaymentByInvoice);
router.get("/transaction/:transactionCode", verifyToken, controller.getPaymentByTransactionCode);

router.get("/status/:status", verifyToken, controller.getPaymentsByStatus);
router.get("/method/:method", verifyToken, controller.getPaymentsByMethod);

/**
 * ACTIONS
 */
router.patch("/:id/status", verifyToken, controller.updatePaymentStatus);

router.post(
  "/process",
  verifyToken,
  controller.processPayment
);

router.patch("/:id/confirm", verifyToken, controller.confirmPayment);
router.patch("/:id/cancel", verifyToken, controller.cancelPayment);

/**
 * MOMO
 */
router.post("/momo", verifyToken, controller.createMoMoPayment);
router.post("/momo-ipn", controller.handleMoMoIPN);

module.exports = router;