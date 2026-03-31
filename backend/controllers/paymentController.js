const Payment = require("../schemas/paymentSchema");
const Invoice = require("../schemas/invoiceSchema");
const Table = require("../schemas/tableSchema");
const responseHandler = require("../utils/responseHandler");
const momoConfig = require("../config/momo");
const crypto = require("crypto");
const axios = require("axios");

// ================= MOMO =================
exports.createMoMoPayment = async (req, res, next) => {
  try {
    const { invoiceId, amount, orderInfo } = req.body;

    if (!invoiceId || !amount) {
      return responseHandler.error(res, "Missing invoiceId or amount", 400);
    }

    // Parameters từ code mẫu MoMo test chuẩn
    var accessKey = 'F8BBA842ECF85';
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var partnerCode = 'MOMO';
    var redirectUrl = momoConfig.redirectUrl;
    var ipnUrl = momoConfig.ipnUrl;
    var requestType = "payWithMethod"; // Hoàn tác về payWithMethod
    var amountValue = amount.toString();
    var orderId = partnerCode + new Date().getTime();
    var requestId = orderId;
    var extraData = '';
    var orderGroupId = '';
    var autoCapture = true;
    var lang = 'vi';
    var info = orderInfo || 'pay with MoMo';

    // Trước khi ký HMAC SHA256 với định dạng chuẩn MoMo
    var rawSignature = "accessKey=" + accessKey + "&amount=" + amountValue + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + info + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;

    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)

    var signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    const requestBody = {
      partnerCode: partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amountValue,
      orderId: orderId,
      orderInfo: info,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature
    };

    console.log("Sending to MoMo....", JSON.stringify(requestBody));

    // Dùng axios cho đồng bộ với các controller khác và dễ xử lý response
    const response = await axios.post(momoConfig.apiEndpoint, requestBody);

    console.log("MoMo Response Body:", response.data);

    if (response.data.resultCode === 0) {
      // Lưu payment vào DB với trạng thái PENDING
      await Payment.create({
        invoiceId,
        amount: parseInt(amount),
        method: "MOMO",
        status: "PENDING",
        transactionCode: orderId
      });

      return responseHandler.success(res, response.data);
    } else {
      return responseHandler.error(res, response.data.message || "MoMo request failed", 400, response.data);
    }

  } catch (err) {
    console.error("MoMo Error Detail:", err.response?.data || err.message);
    const detail = err.response?.data || {};
    return res.status(err.response?.status || 500).json({
      success: false,
      message: detail.message || err.message,
      data: detail
    });
  }
};

exports.handleMoMoIPN = async (req, res, next) => {
  try {
    const { orderId, resultCode, transId, message } = req.body;
    console.log("MoMo IPN Received:", req.body);

    const payment = await Payment.findOne({ where: { transactionCode: orderId } });

    if (payment) {
      if (resultCode == 0) { // resultCode = 0 means success in MoMo
        const now = new Date();
        
        await payment.update({
          status: "SUCCESS",
          transactionCode: transId,
          paidAt: now
        });

        // Tìm hóa đơn để giải phóng bàn
        const invoice = await Invoice.findByPk(payment.invoiceId);
        if (invoice) {
          // 1. Cập nhật trạng thái hóa đơn sang PAID
          await invoice.update({
            status: "PAID",
            paidAt: now
          });

          // 2. Cập nhật trạng thái bàn sang AVAILABLE
          await Table.update(
            { status: "AVAILABLE" },
            { where: { id: invoice.tableId } }
          );

          console.log(`✅ Invoice #${invoice.id} PAID & Table #${invoice.tableId} AVAILABLE via MoMo IPN`);
        }
      } else {
        await payment.update({ status: "FAILED" });
      }
    }

    // Luôn trả về 204 cho MoMo để xác nhận đã nhận IPN
    return res.status(204).send();
  } catch (err) {
    console.error("IPN Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

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
    const { invoiceId, method, amount } = req.query;

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

// ================= CONFIRM (Admin/Staff Action) =================
exports.confirmPayment = async (req, res, next) => {
  try {
    const { transactionCode } = req.body;
    const now = new Date();

    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return responseHandler.error(res, "Payment not found", 404);
    }

    await payment.update({
      status: "SUCCESS",
      transactionCode: transactionCode || "CASH-" + Date.now(),
      paidAt: now
    });

    const invoice = await Invoice.findByPk(payment.invoiceId);
    if (invoice) {
      // 1. Cập nhật hóa đơn
      await invoice.update({
        status: "PAID",
        paidAt: now
      });

      // 2. Giải phóng bàn
      await Table.update(
        { status: "AVAILABLE" },
        { where: { id: invoice.tableId } }
      );
    }

    return responseHandler.success(res, payment, "Payment confirmed & Table released");
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