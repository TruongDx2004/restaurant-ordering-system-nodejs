const Payment = require("../schemas/paymentSchema");
const Invoice = require("../schemas/invoiceSchema");
const Table = require("../schemas/tableSchema");
const notificationController = require("./notificationController");
const socketHandler = require("../utils/socketHandler");
const momoConfig = require("../config/momo");
const crypto = require("crypto");
const axios = require("axios");

module.exports = {
    // Xử lý thanh toán MoMo
    CreateMoMoPayment: async function (invoiceId, amount, orderInfo) {
        if (!invoiceId || !amount) {
            throw new Error("Missing invoiceId or amount");
        }

        const accessKey = 'F8BBA842ECF85';
        const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const partnerCode = 'MOMO';
        const redirectUrl = momoConfig.redirectUrl;
        const ipnUrl = momoConfig.ipnUrl;
        const requestType = "payWithMethod";
        const amountValue = amount.toString();
        const orderId = partnerCode + new Date().getTime();
        const requestId = orderId;
        const extraData = '';
        const orderGroupId = '';
        const autoCapture = true;
        const lang = 'vi';
        const info = orderInfo || 'pay with MoMo';

        const rawSignature = `accessKey=${accessKey}&amount=${amountValue}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${info}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode,
            partnerName: "Test",
            storeId: "MomoTestStore",
            requestId,
            amount: amountValue,
            orderId,
            orderInfo: info,
            redirectUrl,
            ipnUrl,
            lang,
            requestType,
            autoCapture,
            extraData,
            orderGroupId,
            signature
        };

        const response = await axios.post(momoConfig.apiEndpoint, requestBody);

        if (response.data.resultCode === 0) {
            await Payment.create({
                invoiceId,
                amount: parseInt(amount),
                method: "MOMO",
                status: "PENDING",
                transactionCode: orderId
            });
            return response.data;
        } else {
            throw new Error(response.data.message || "MoMo request failed");
        }
    },

    HandleMoMoIPN: async function (ipnData) {
        const { orderId, resultCode, transId } = ipnData;
        const payment = await Payment.findOne({ where: { transactionCode: orderId } });

        if (payment) {
            if (resultCode == 0) {
                const now = new Date();
                await payment.update({
                    status: "SUCCESS",
                    transactionCode: transId,
                    paidAt: now
                });

                const invoice = await Invoice.findByPk(payment.invoiceId);
                if (invoice) {
                    await invoice.update({ status: "PAID", paidAt: now });
                    await Table.update({ status: "AVAILABLE" }, { where: { id: invoice.tableId } });

                    await notificationController.createAndSend({
                        title: "Thanh toán thành công",
                        message: `Hóa đơn #${invoice.id} (Bàn ${invoice.tableId}) đã được thanh toán qua MoMo.`,
                        type: "PAYMENT_SUCCESS",
                        recipientType: "ALL",
                        data: { invoiceId: invoice.id, tableId: invoice.tableId, method: "MOMO" }
                    });
                    
                    // Gửi tín hiệu WebSocket để khách hàng chuyển trang
                    socketHandler.sendPaymentNotification(invoice.id, invoice.tableId, "PAID");
                }
            } else {
                await payment.update({ status: "FAILED" });
            }
        }
    },

    // Xử lý yêu cầu thanh toán tiền mặt
    RequestCashPayment: async function (invoiceId, tableId, amount) {
        if (!invoiceId || !tableId) {
            throw new Error("Missing required fields");
        }

        await notificationController.createAndSend({
            title: "Yêu cầu thanh toán tiền mặt",
            message: `Bàn ${tableId} yêu cầu thanh toán ${parseInt(amount).toLocaleString('vi-VN')} VND.`,
            type: "CASH_PAYMENT_REQUEST",
            recipientType: "ALL",
            data: {
                invoiceId,
                tableId,
                amount,
                action: "CONFIRM_PAYMENT"
            }
        });
        return true;
    },

    // Xác nhận thanh toán theo hóa đơn
    ConfirmPaymentByInvoice: async function (invoiceId, transactionCode) {
        if (!invoiceId) throw new Error("Missing invoiceId");

        const now = new Date();
        let payment = await Payment.findOne({ where: { invoiceId } });

        if (!payment) {
            const invoice = await Invoice.findByPk(invoiceId);
            if (!invoice) throw new Error("Invoice not found");

            payment = await Payment.create({
                invoiceId,
                amount: invoice.totalAmount,
                method: "CASH",
                status: "SUCCESS",
                transactionCode: transactionCode || "CASH-" + Date.now(),
                paidAt: now
            });
        } else {
            await payment.update({
                status: "SUCCESS",
                transactionCode: transactionCode || "CASH-" + Date.now(),
                paidAt: now
            });
        }

        const invoice = await Invoice.findByPk(invoiceId);
        if (invoice) {
            await invoice.update({ status: "PAID", paidAt: now });
            await Table.update({ status: "AVAILABLE" }, { where: { id: invoice.tableId } });

            await notificationController.createAndSend({
                title: "Xác nhận thanh toán",
                message: `Hóa đơn #${invoice.id} (Bàn ${invoice.tableId}) đã được xác nhận thanh toán thành công.`,
                type: "PAYMENT_SUCCESS",
                recipientType: "ALL",
                data: { invoiceId: invoice.id, tableId: invoice.tableId }
            });

            // Gửi tín hiệu WebSocket trực tiếp để khách hàng tại trang Invoice/PaymentWaiting chuyển trang
            socketHandler.sendPaymentNotification(invoice.id, invoice.tableId, "PAID");
            
            // Cập nhật trạng thái bàn real-time
            socketHandler.sendTableStatusUpdate(invoice.tableId, "AVAILABLE");
        }
        return payment;
    },

    // Xử lý tạo thanh toán chung
    ProcessPayment: async function (invoiceId, method, amount) {
        if (!invoiceId || !method || !amount) {
            throw new Error("Missing required fields");
        }

        return await Payment.create({
            invoiceId,
            method,
            amount,
            status: "PENDING"
        });
    },

    // Lấy tất cả thanh toán (giữ lại cho Admin nếu cần)
    GetAllPayments: async function () {
        return await Payment.findAll();
    }
};
