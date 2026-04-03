const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");

// Lấy tất cả thanh toán (ADMIN)
router.get("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        const payments = await paymentController.GetAllPayments();
        return responseHandler.success(res, payments, "Payments retrieved successfully");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Xử lý tạo thanh toán chung (Customer/Staff)
router.post("/process", checkLogin, async function (req, res, next) {
    try {
        const { invoiceId, method, amount } = req.query; // Giữ nguyên req.query như code cũ để tương thích frontend
        const payment = await paymentController.ProcessPayment(invoiceId, method, amount);
        return responseHandler.success(res, payment, "Payment processed");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Yêu cầu thanh toán tiền mặt (Customer)
router.post("/request-cash", checkLogin, async function (req, res, next) {
    try {
        const { invoiceId, tableId, amount } = req.body;
        await paymentController.RequestCashPayment(invoiceId, tableId, amount);
        return responseHandler.success(res, null, "Cash payment request sent to all staff");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Xác nhận thanh toán theo hóa đơn (Staff/Admin)
router.patch("/confirm-by-invoice", checkLogin, async function (req, res, next) {
    try {
        const { invoiceId, transactionCode } = req.body;
        const payment = await paymentController.ConfirmPaymentByInvoice(invoiceId, transactionCode);
        return responseHandler.success(res, payment, "Payment confirmed");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Tạo thanh toán qua MoMo (Customer)
router.post("/momo", checkLogin, async function (req, res, next) {
    try {
        const { invoiceId, amount, orderInfo } = req.body;
        const result = await paymentController.CreateMoMoPayment(invoiceId, amount, orderInfo);
        return responseHandler.success(res, result, "MoMo payment link created");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//POST api/momo-ipn
router.post("/momo-ipn", async function (req, res, next) {
    try {
        await paymentController.HandleMoMoIPN(req.body.orderId, req.body.resultCode, req.body.transId);
        return res.status(204).send();
    } catch (err) {
        console.error("MoMo IPN Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
