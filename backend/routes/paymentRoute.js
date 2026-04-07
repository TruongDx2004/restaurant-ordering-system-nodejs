const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");
const { validate, paymentValidator } = require("../utils/validateHandler");

// Lấy tất cả thanh toán (ADMIN)
router.get("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        const payments = await paymentController.GetAllPayments();
        return responseHandler.success(res, payments, "Các thanh toán được lấy thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//POST api/payments/process?invoiceId=123&method=MoMo&amount=100000
router.post("/process", checkLogin, paymentValidator.process, validate, async function (req, res, next) {
    try {
        const { invoiceId, method, amount } = req.query;
        const payment = await paymentController.ProcessPayment(invoiceId, method, amount);
        return responseHandler.success(res, payment, "Thanh toán được xử lý thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//POST api/payments/request-cash
router.post("/request-cash", checkLogin, paymentValidator.requestCash, validate, async function (req, res, next) {
    try {
        const { invoiceId, tableId, amount } = req.body;
        await paymentController.RequestCashPayment(invoiceId, tableId, amount);
        return responseHandler.success(res, null, "Yêu cầu thanh toán bằng tiền mặt đã được gửi đến tất cả nhân viên");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// PATCH api/payments/confirm-by-invoice
router.patch("/confirm-by-invoice", checkLogin, paymentValidator.confirmByInvoice, validate, async function (req, res, next) {
    try {
        const { invoiceId, transactionCode } = req.body;
        const payment = await paymentController.ConfirmPaymentByInvoice(invoiceId, transactionCode);
        return responseHandler.success(res, payment, "Thanh toán đã được xác nhận");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// POST api/payments/momo
router.post("/momo", checkLogin, paymentValidator.momo, validate, async function (req, res, next) {
    try {
        const { invoiceId, amount, orderInfo } = req.body;
        const result = await paymentController.CreateMoMoPayment(invoiceId, amount, orderInfo);
        return responseHandler.success(res, result, "Liên kết thanh toán MoMo đã được tạo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//POST api/payments/momo-ipn
router.post("/momo-ipn", paymentValidator.momoIPN, validate, async function (req, res, next) {
    try {
        await paymentController.HandleMoMoIPN(req.body.orderId, req.body.resultCode, req.body.transId);
        return res.status(200).send();
    } catch (err) {
        console.error("MoMo IPN Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
