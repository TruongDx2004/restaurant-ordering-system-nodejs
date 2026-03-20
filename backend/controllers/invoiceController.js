const { Invoice, Table, InvoiceItem, Dish, Category } = require("../schemas");
const responseHandler = require("../utils/responseHandler");
const { Op } = require("sequelize");

// ===== MAPPER =====
const toResponse = (invoice) => ({
    id: invoice.id,

    table: invoice.Table
        ? {
            id: invoice.Table.id,
            tableNumber: invoice.Table.tableNumber,
            area: invoice.Table.area,
            status: invoice.Table.status,
            isActive: invoice.Table.isActive
        }
        : null,

    totalAmount: Number(invoice.totalAmount),
    status: invoice.status,
    createdAt: invoice.createdAt,
    paidAt: invoice.paidAt,

    items: invoice.items
        ? invoice.items.map(item => ({
            id: item.id,

            dish: item.Dish
                ? {
                    id: item.Dish.id,
                    name: item.Dish.name,
                    price: item.Dish.price,
                    status: item.Dish.status,
                    image: item.Dish.image,
                    category: item.Dish.Category
                        ? {
                            id: item.Dish.Category.id,
                            name: item.Dish.Category.name
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
                { model: Table },
                {
                    model: InvoiceItem,
                    as: "items",
                    include: [
                        {
                            model: Dish,
                            include: [Category]
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
                    model: Table
                },
                {
                    model: InvoiceItem,
                    as: "items",
                    include: [
                        {
                            model: Dish,
                            include: [Category]
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

// GET ACTIVE BY TABLE NUMBER (simplified)
exports.getActiveInvoiceByTableNumber = async (req, res, next) => {
    try {
        // NOTE: cần join Table nếu muốn đúng như Java
        return responseHandler.success(
            res,
            null,
            "Not implemented fully (requires join with table)"
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
