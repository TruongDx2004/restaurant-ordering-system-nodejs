const Payment = require("../schemas/paymentSchema");
const responseHandler = require("../utils/responseHandler");

// ================= CREATE =================
exports.createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);

    return responseHandler.success(res, payment, "Payment created");
  } catch (err) {
    next(err);
  }
};

// ================= GET BY ID =================
exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return responseHandler.error(res, "Payment not found", 404);
    }

    return responseHandler.success(res, payment);
  } catch (err) {
    next(err);
  }
};

// ================= GET ALL =================
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll();
    return responseHandler.success(res, payments);
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE =================
exports.updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return responseHandler.error(res, "Payment not found", 404);
    }

    await payment.update(req.body);

    return responseHandler.success(res, payment, "Updated");
  } catch (err) {
    next(err);
  }
};

// ================= DELETE =================
exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return responseHandler.error(res, "Payment not found", 404);
    }

    await payment.destroy();

    return responseHandler.success(res, null, "Deleted");
  } catch (err) {
    next(err);
  }
};

// ================= FILTER =================

// by invoice
exports.getPaymentByInvoice = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      where: { invoiceId: req.params.invoiceId }
    });

    return responseHandler.success(res, payment);
  } catch (err) {
    next(err);
  }
};

// by transaction
exports.getPaymentByTransactionCode = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      where: { transactionCode: req.params.transactionCode }
    });

    return responseHandler.success(res, payment);
  } catch (err) {
    next(err);
  }
};

// by status
exports.getPaymentsByStatus = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      where: { status: req.params.status }
    });

    return responseHandler.success(res, payments);
  } catch (err) {
    next(err);
  }
};

// by method
exports.getPaymentsByMethod = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      where: { method: req.params.method }
    });

    return responseHandler.success(res, payments);
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE STATUS =================
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return responseHandler.error(res, "Payment not found", 404);
    }

    await payment.update({ status });

    return responseHandler.success(res, payment, "Status updated");
  } catch (err) {
    next(err);
  }
};
// ================= PROCESS =================
exports.processPayment = async (req, res, next) => {
  try {
    const { invoiceId, method, amount } = req.body;

    if (!invoiceId || !method || !amount) {
      return responseHandler.error(res, "Missing required fields", 400);
    }

    const payment = await Payment.create({
      invoiceId,
      method,
      amount,
      status: "PENDING"
    });

    return responseHandler.success(res, payment, "Payment processed");
  } catch (err) {
    next(err);
  }
};

// ================= CONFIRM =================
exports.confirmPayment = async (req, res, next) => {
  try {
    const { transactionCode } = req.body;

    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return responseHandler.error(res, "Payment not found", 404);
    }

    await payment.update({
      status: "SUCCESS",
      transactionCode
    });

    return responseHandler.success(res, payment, "Payment confirmed");
  } catch (err) {
    next(err);
  }
};

// ================= CANCEL =================
exports.cancelPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return responseHandler.error(res, "Payment not found", 404);
    }

    await payment.update({ status: "FAILED" });

    return responseHandler.success(res, payment, "Payment cancelled");
  } catch (err) {
    next(err);
  }
};