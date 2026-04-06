const { Invoice, Table, InvoiceItem, Dish, Category } = require("../schemas");
const { Op } = require("sequelize");
const sequelize = require("../config/db");
const webSocketService = require("../utils/socketHandler");

const toResponse = (invoice) => ({
    id: invoice.id,
    table: invoice.table
        ? {
            id: invoice.table.id,
            tableNumber: invoice.table.tableNumber,
            area: invoice.table.area,
            status: invoice.table.status,
            isActive: invoice.table.isActive
        }
        : invoice.tableId ? { id: invoice.tableId } : null,
    totalAmount: Number(invoice.totalAmount),
    status: invoice.status,
    createdAt: invoice.createdAt,
    paidAt: invoice.paidAt,
    items: invoice.items?.map(item => ({
        id: item.id,
        dish: item.dish ? {
            id: item.dish.id,
            name: item.dish.name,
            price: Number(item.dish.price),
            status: item.dish.status,
            image: item.dish.image,
            category: item.dish.category ? {
                id: item.dish.category.id,
                name: item.dish.category.name
            } : null
        } : null,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        status: item.status,
        note: item.note
    })) || []
});

module.exports = {

    CreateInvoice: async function (data) {
        return await Invoice.create(data);
    },

    GetInvoiceById: async function (id) {
        const invoice = await Invoice.findByPk(id, {
            include: [
                { model: Table, as: "table" },
                {
                    model: InvoiceItem,
                    as: "items",
                    include: [{
                        model: Dish,
                        as: "dish",
                        include: [{ model: Category, as: "category" }]
                    }]
                }
            ]
        });

        if (!invoice) throw new Error("Không tìm thấy hóa đơn");
        return invoice;
    },

    GetAllInvoices: async function () {
        return await Invoice.findAll({
            include: [
                { model: Table, as: "table" },
                {
                    model: InvoiceItem,
                    as: "items",
                    include: [{
                        model: Dish,
                        as: "dish",
                        include: [{ model: Category, as: "category" }]
                    }]
                }
            ]
        });
    },

    UpdateInvoice: async function (id, data) {
        const invoice = await Invoice.findByPk(id);
        if (!invoice) throw new Error("Không tìm thấy hóa đơn");

        return await invoice.update(data);
    },

    DeleteInvoice: async function (id) {
        const invoice = await Invoice.findByPk(id);
        if (!invoice) throw new Error("Không tìm thấy hóa đơn");

        return await invoice.destroy();
    },

    GetInvoicesByStatus: async function (status) {
        return await Invoice.findAll({ where: { status } });
    },

    GetInvoicesByTable: async function (tableId) {
        return await Invoice.findAll({ where: { tableId } });
    },

    GetInvoicesByDateRange: async function (startDate, endDate) {
        return await Invoice.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        });
    },

    UpdateInvoiceStatus: async function (id, status) {
        if (!status) throw new Error("Thiếu thông tin trạng thái");

        status = status.toUpperCase().trim();
        const allowed = ["OPEN", "PAID", "CANCELLED"];
        if (!allowed.includes(status)) throw new Error("Trang thái không hợp lệ");

        const t = await sequelize.transaction();

        try {
            const invoice = await Invoice.findByPk(id, { transaction: t });
            if (!invoice) throw new Error("Không tìm thấy hóa đơn");

            await invoice.update({
                status,
                paidAt: status === "PAID" ? new Date() : null
            }, { transaction: t });

            if (status === "PAID" || status === "CANCELLED") {
                await Table.update(
                    { status: "AVAILABLE" },
                    { where: { id: invoice.tableId }, transaction: t }
                );
            }

            await t.commit();

            if (status === "PAID") {
                webSocketService.sendPaymentNotification(invoice.id, invoice.tableId, "PAID");
            }

            webSocketService.sendTableStatusUpdate(invoice.tableId, "AVAILABLE");

            return invoice;

        } catch (err) {
            await t.rollback();
            throw err;
        }
    },

    CreateInvoiceWithItems: async function (tableId, items) {
        const t = await sequelize.transaction();

        try {
            if (!tableId) throw new Error("Thiếu thông tin bàn");
            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new Error("Thiếu thông tin món ăn");
            }

            const table = await Table.findByPk(tableId, { transaction: t });
            if (!table) throw new Error("Bàn không tồn tại");

            let invoice;

            if (table.status === "AVAILABLE") {
                invoice = await Invoice.create({
                    tableId,
                    status: "OPEN",
                    totalAmount: 0
                }, { transaction: t });

                await table.update(
                    { status: "OCCUPIED" },
                    { transaction: t }
                );
            }

            else if (table.status === "OCCUPIED") {
                invoice = await Invoice.findOne({
                    where: { tableId, status: "OPEN" },
                    transaction: t
                });

                if (!invoice) {
                    throw new Error("Bàn đang bận nhưng không tìm thấy hóa đơn mở");
                }
            }

            else {
                throw new Error("Bàn không khả dụng để tạo hóa đơn");
            }

            let totalAmount = Number(invoice.totalAmount || 0);

            for (const item of items) {

                const quantity = Number(item.quantity);
                if (!quantity || quantity <= 0) {
                    throw new Error(`Số lượng không hợp lệ cho món ${item.dishId}`);
                }

                const dish = await Dish.findByPk(item.dishId, { transaction: t });
                if (!dish) {
                    throw new Error(`Món ăn không tồn tại: ${item.dishId}`);
                }

                if (dish.status !== "AVAILABLE") {
                    throw new Error(`Món ${dish.name} đã hết, vui lòng chọn món khác!`);
                }

                const unitPrice = Number(dish.price);
                const status = item.status || "WAITING";

                let existingItem = await InvoiceItem.findOne({
                    where: {
                        invoiceId: invoice.id,
                        dishId: item.dishId,
                        note: item.note,
                        status
                    },
                    transaction: t
                });

                if (existingItem) {
                    const newQuantity = existingItem.quantity + quantity;
                    const newTotal = newQuantity * unitPrice;

                    totalAmount -= Number(existingItem.totalPrice || 0);

                    await existingItem.update({
                        quantity: newQuantity,
                        totalPrice: newTotal
                    }, { transaction: t });

                    totalAmount += newTotal;

                } else {
                    const totalPrice = unitPrice * quantity;
                    console.log("Note for item:", item.note);
                    await InvoiceItem.create({
                        invoiceId: invoice.id,
                        dishId: item.dishId,
                        quantity,
                        unitPrice,
                        totalPrice,
                        status,
                        note: item.note || ""
                    }, { transaction: t });

                    totalAmount += totalPrice;
                }
            }

            await invoice.update(
                { totalAmount },
                { transaction: t }
            );

            await t.commit();

            webSocketService.sendNewOrderNotification(invoice.id, invoice.tableId);
            webSocketService.sendTableStatusUpdate(invoice.tableId, "OCCUPIED");
            
            return await this.GetInvoiceById(invoice.id);

        } catch (err) {
            await t.rollback();
            throw err;
        }
    },

    GetActiveInvoiceByTable: async function (tableId) {
        const invoice = await Invoice.findOne({
            where: {
                tableId,
                status: "OPEN"
            },
            include: [
                { model: Table, as: "table" },
                {
                    model: InvoiceItem,
                    as: "items",
                    include: [{
                        model: Dish,
                        as: "dish",
                        include: [{ model: Category, as: "category" }]
                    }]
                }
            ]
        });

        return invoice;
    },

    GetActiveInvoiceByTableNumber: async function (tableNumber) {
        const invoice = await Invoice.findOne({
            where: { status: "OPEN" },
            include: [
                {
                    model: Table,
                    as: "table",
                    where: { tableNumber }
                },
                {
                    model: InvoiceItem,
                    as: "items",
                    include: [{
                        model: Dish,
                        as: "dish",
                        include: [{ model: Category, as: "category" }]
                    }]
                }
            ]
        });

        return invoice;
    },

    ToResponse: toResponse
};