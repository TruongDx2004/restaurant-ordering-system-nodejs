const { Invoice, Table, InvoiceItem, Dish, Category } = require("../schemas");
const responseHandler = require("../utils/responseHandler");
const { Op } = require("sequelize");
const sequelize = require("../config/db");
const webSocketService = require("../utils/webSocketService"); // Import WebSocketService

// ===== MAPPER =====
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
        : null,

    totalAmount: Number(invoice.totalAmount),
    status: invoice.status,
    createdAt: invoice.createdAt,
    paidAt: invoice.paidAt,

    items: invoice.items
        ? invoice.items.map(item => ({
            id: item.id,

            dish: item.dish
                ? {
                    id: item.dish.id,
                    name: item.dish.name,
                    price: Number(item.dish.price),
                    status: item.dish.status,
                    image: item.dish.image,

                    category: item.dish.category
                        ? {
                            id: item.dish.category.id,
                            name: item.dish.category.name
                        }
                        : null
                }
                : null,

            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
            status: item.status,
            note: item.note,
            createdAt: item.createdAt || null,
            updatedAt: item.updatedAt || null
        }))
        : []
});

// ===== CONTROLLER =====

// CREATE
exports.createInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.create(req.body);

        return responseHandler.success(
            res,
            toResponse(invoice),
            "Invoice created successfully"
        );
    } catch (err) {
        next(err);
    }
};

// GET BY ID
exports.getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Table,
                    as: "table"
                },
                {
                    model: InvoiceItem,
                    as: "items",
                    include: [
                        {
                            model: Dish,
                            as: "dish",
                            include: [
                                {
                                    model: Category,
                                    as: "category"
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!invoice) {
            return responseHandler.error(res, "Invoice not found", 404);
        }

        return responseHandler.success(
            res,
            toResponse(invoice),
            "Invoice retrieved successfully"
        );

    } catch (err) {
        next(err);
    }
};

// GET ALL
exports.getAllInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice.findAll({
            include: [
                {
                    model: Table,
                    as: "table"
                },
                {
                    model: InvoiceItem,
                    as: "items",
                    include: [
                        {
                            model: Dish,
                            as: "dish",
                            include: [
                                {
                                    model: Category,
                                    as: "category"
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        return responseHandler.success(
            res,
            invoices.map(toResponse),
            "Invoices retrieved successfully"
        );

    } catch (err) {
        next(err);
    }
};

// UPDATE
exports.updateInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) {
            return responseHandler.error(res, "Invoice not found", 404);
        }

        await invoice.update(req.body);

        return responseHandler.success(
            res,
            toResponse(invoice),
            "Invoice updated successfully"
        );
    } catch (err) {
        next(err);
    }
};

// DELETE
exports.deleteInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) {
            return responseHandler.error(res, "Invoice not found", 404);
        }

        await invoice.destroy();

        return responseHandler.success(
            res,
            null,
            "Invoice deleted successfully"
        );
    } catch (err) {
        next(err);
    }
};

// GET BY STATUS
exports.getInvoicesByStatus = async (req, res, next) => {
    try {
        const invoices = await Invoice.findAll({
            where: { status: req.params.status }
        });

        return responseHandler.success(
            res,
            invoices.map(toResponse),
            "Invoices retrieved successfully"
        );
    } catch (err) {
        next(err);
    }
};

// GET BY TABLE
exports.getInvoicesByTable = async (req, res, next) => {
    try {
        const invoices = await Invoice.findAll({
            where: { tableId: req.params.tableId }
        });

        return responseHandler.success(
            res,
            invoices.map(toResponse),
            "Invoices retrieved successfully"
        );
    } catch (err) {
        next(err);
    }
};

// GET BY DATE RANGE
exports.getInvoicesByDateRange = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        const invoices = await Invoice.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        });

        return responseHandler.success(
            res,
            invoices.map(toResponse),
            "Invoices retrieved successfully"
        );
    } catch (err) {
        next(err);
    }
};

// UPDATE STATUS
exports.updateInvoiceStatus = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) {
            return responseHandler.error(res, "Invoice not found", 404);
        }

        let { status } = req.query;

        if (!status) {
            return responseHandler.error(res, "Status is required", 400);
        }

        status = status.toUpperCase().trim();

        const allowed = ["OPEN", "PAID", "CANCELLED"];
        if (!allowed.includes(status)) {
            return responseHandler.error(res, "Invalid status", 400);
        }

        await invoice.update({
            status,
            paidAt: status === "PAID" ? new Date() : null
        });

        // ================= WEBSOCKET =================
        if (status === "PAID") {
            webSocketService.sendPaymentNotification(invoice.id, invoice.tableId, "PAID");
            webSocketService.sendTableStatusUpdate(invoice.tableId, "AVAILABLE", null);
        } else if (status === "CANCELLED") {
            webSocketService.sendTableStatusUpdate(invoice.tableId, "AVAILABLE", null);
        }

        return responseHandler.success(
            res,
            toResponse(invoice),
            "Invoice status updated successfully"
        );
    } catch (err) {
        next(err);
    }
};

// GET ACTIVE INVOICE BY TABLE
exports.getActiveInvoiceByTable = async (req, res, next) => {
    try {
        const invoice = await Invoice.findOne({
            where: {
                tableId: req.params.tableId,
                status: "OPEN"
            }
        });

        return responseHandler.success(
            res,
            invoice ? toResponse(invoice) : null,
            "Active invoice retrieved successfully"
        );
    } catch (err) {
        next(err);
    }
};

// CALCULATE TOTAL (basic version)
exports.calculateInvoiceTotal = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) {
            return responseHandler.error(res, "Invoice not found", 404);
        }

        return responseHandler.success(
            res,
            invoice.totalAmount,
            "Invoice total calculated successfully"
        );
    } catch (err) {
        next(err);
    }
};

//Get INVOICE By TableNumber
exports.getActiveInvoiceByTableNumber = async (req, res, next) => {
    try {
        const { tableNumber } = req.params;

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
                    include: [
                        {
                            model: Dish,
                            as: "dish",
                            include: [
                                {
                                    model: Category,
                                    as: "category"
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        return responseHandler.success(
            res,
            invoice ? toResponse(invoice) : null,
            "Active invoice retrieved successfully"
        );

    } catch (err) {
        next(err);
    }
};

//Create InvoiceItem
exports.createInvoiceWithItems = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { tableId, items } = req.body;

        const table = await Table.findByPk(tableId, { transaction: t });

        if (!table) {
            throw new Error("Table not found");
        }

        let invoice = null;

        // ===== CASE 1: TABLE AVAILABLE =====
        if (table.status === "AVAILABLE") {
            invoice = await Invoice.create({
                tableId,
                status: "OPEN",
                totalAmount: 0
            }, { transaction: t });

            await table.update({ status: "OCCUPIED" }, { transaction: t });
        }

        // ===== CASE 2: TABLE OCCUPIED =====
        else if (table.status === "OCCUPIED") {
            invoice = await Invoice.findOne({
                where: {
                    tableId,
                    status: "OPEN"
                },
                include: [{ model: InvoiceItem, as: "items" }],
                transaction: t
            });

            if (!invoice) {
                throw new Error("Table occupied but no active invoice");
            }
        }

        // ===== CASE 3: INVALID =====
        else {
            throw new Error("Table not available");
        }

        let totalAmount = Number(invoice.totalAmount);

        for (const item of items) {
            const dish = await Dish.findByPk(item.dishId, { transaction: t });

            if (!dish) {
                throw new Error(`Dish not found: ${item.dishId}`);
            }

            const unitPrice = Number(dish.price);
            const quantity = item.quantity;

            // check existing item
            let existingItem = await InvoiceItem.findOne({
                where: {
                    invoiceId: invoice.id,
                    dishId: item.dishId,
                    status: item.status || "WAITING"
                },
                transaction: t
            });

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                const newTotal = newQuantity * unitPrice;

                totalAmount -= Number(existingItem.totalPrice);

                await existingItem.update({
                    quantity: newQuantity,
                    totalPrice: newTotal
                }, { transaction: t });

                totalAmount += newTotal;

            } else {
                const totalPrice = unitPrice * quantity;

                await InvoiceItem.create({
                    invoiceId: invoice.id,
                    dishId: item.dishId,
                    quantity,
                    unitPrice,
                    totalPrice,
                    status: item.status || "WAITING",
                    note: item.note || ""
                }, { transaction: t });

                totalAmount += totalPrice;
            }
        }

        await invoice.update({ totalAmount }, { transaction: t });

        await t.commit();

        // ================= WEBSOCKET =================
        webSocketService.sendNewOrderNotification(invoice.id, tableId, "Có đơn hàng mới tại bàn " + tableId);
        webSocketService.sendTableStatusUpdate(tableId, "OCCUPIED", null);

        // reload full data giống Java
        const fullInvoice = await Invoice.findByPk(invoice.id, {
            include: [
                {
                    model: Table,
                    as: "table"
                },
                {
                    model: InvoiceItem,
                    as: "items",
                    include: [
                        {
                            model: Dish,
                            as: "dish",
                            include: [
                                {
                                    model: Category,
                                    as: "category"
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        return responseHandler.success(
            res,
            toResponse(fullInvoice),
            "Invoice with items created successfully"
        );

    } catch (err) {
        await t.rollback();
        next(err);
    }
};
