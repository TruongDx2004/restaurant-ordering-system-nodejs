const express = require("express");
const router = express.Router();

const controller = require("../controllers/paymentController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const momo = require("../config/momo");
const { validate, paymentValidator } = require("../utils/validateHandler");

router.post("/", checkLogin, checkRole("ADMIN"), paymentValidator.create, validate, controller.createPayment);
router.put("/:id", checkLogin, checkRole("ADMIN"), paymentValidator.update, validate, controller.updatePayment);
router.delete("/:id", checkLogin, checkRole("ADMIN"), paymentValidator.delete, validate, controller.deletePayment);

router.get("/", checkLogin, controller.getAllPayments);
router.get("/:id", checkLogin, paymentValidator.getById, validate, controller.getPaymentById);
router.get("/invoice/:invoiceId", checkLogin, paymentValidator.getByInvoice, validate, controller.getPaymentByInvoice);
router.get("/transaction/:transactionCode", checkLogin, paymentValidator.getByTransaction, validate, controller.getPaymentByTransactionCode);
router.get("/status/:status", checkLogin, paymentValidator.getByStatus, validate, controller.getPaymentsByStatus);
router.get("/method/:method", checkLogin, paymentValidator.getByMethod, validate, controller.getPaymentsByMethod);

router.patch("/:id/status", checkLogin, paymentValidator.updateStatus, validate, controller.updatePaymentStatus);
router.post("/process", checkLogin, paymentValidator.process, validate, controller.processPayment);
router.post("/request-cash", checkLogin, paymentValidator.requestCash, validate, controller.requestCashPayment);
router.patch("/:id/confirm", checkLogin, paymentValidator.confirm, validate, controller.confirmPayment);
router.patch("/confirm-by-invoice", checkLogin, paymentValidator.confirmByInvoice, validate, controller.confirmPaymentByInvoice);
router.patch("/:id/cancel", checkLogin, paymentValidator.cancel, validate, controller.cancelPayment);

router.post("/momo", checkLogin, paymentValidator.momo, validate, controller.createMoMoPayment);
router.post("/momo-ipn", paymentValidator.momoIPN, validate, controller.handleMoMoIPN);

module.exports = router;