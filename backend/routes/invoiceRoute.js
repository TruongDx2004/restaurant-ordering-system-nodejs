const express = require("express");
const router = express.Router();

const controller = require("../controllers/invoiceController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { validate, invoiceValidator } = require("../utils/validateHandler");
const responseHandler = require("../utils/responseHandler");

// POST /api/invoices
router.post("/", invoiceValidator.create, validate, async (req, res) => {
    try {
        const invoice = await controller.CreateInvoice(req.body);
        return responseHandler.success(res, controller.ToResponse(invoice));
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// POST /api/invoices/create-with-items
router.post("/create-with-items", invoiceValidator.createWithItems, validate, async (req, res) => {
    try {
        const { tableId, items } = req.body;
        console.log("Creating invoice with items:", { tableId, items });
        const invoice = await controller.CreateInvoiceWithItems(tableId, items);
        return responseHandler.success(res, controller.ToResponse(invoice));
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});


// ================= GET =================

// GET ALL
router.get("/", checkLogin, async (req, res) => {
    try {
        const data = await controller.GetAllInvoices();
        return responseHandler.success(res, data.map(controller.ToResponse));
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// GET BY ID
router.get("/:id", checkLogin, invoiceValidator.getById, validate, async (req, res) => {
    try {
        const data = await controller.GetInvoiceById(req.params.id);
        return responseHandler.success(res, controller.ToResponse(data));
    } catch (err) {
        return responseHandler.error(res, err.message, 404);
    }
});

// GET BY STATUS
router.get("/status/:status", checkLogin, invoiceValidator.getByStatus, validate, async (req, res) => {
    try {
        const data = await controller.GetInvoicesByStatus(req.params.status);
        return responseHandler.success(res, data.map(controller.ToResponse));
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// GET BY TABLE
router.get("/table/:tableId", checkLogin, invoiceValidator.getByTable, validate, async (req, res) => {
    try {
        const data = await controller.GetInvoicesByTable(req.params.tableId);
        return responseHandler.success(res, data.map(controller.ToResponse));
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// GET ACTIVE BY TABLE
router.get("/table/:tableId/active", checkLogin, invoiceValidator.getActiveByTable, validate, async (req, res) => {
    try {
        const data = await controller.GetActiveInvoiceByTable(req.params.tableId);
        return responseHandler.success(res, data ? controller.ToResponse(data) : null);
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// GET ACTIVE BY TABLE NUMBER
router.get("/table-number/:tableNumber/active", invoiceValidator.getActiveByTableNumber, validate, async (req, res) => {
    try {
        const data = await controller.GetActiveInvoiceByTableNumber(req.params.tableNumber);
        return responseHandler.success(res, data ? controller.ToResponse(data) : null);
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// GET BY DATE RANGE
router.get("/date-range", checkLogin, invoiceValidator.getByDateRange, validate, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await controller.GetInvoicesByDateRange(startDate, endDate);
        return responseHandler.success(res, data.map(controller.ToResponse));
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// CALCULATE TOTAL
router.get("/:id/calculate-total", checkLogin, invoiceValidator.calculateTotal, validate, async (req, res) => {
    try {
        const total = await controller.CalculateInvoiceTotal(req.params.id);
        return responseHandler.success(res, total);
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});


// PUT api/invoices/:id
router.put("/:id", checkLogin, checkRole("ADMIN"), invoiceValidator.update, validate, async (req, res) => {
    try {
        const data = await controller.UpdateInvoice(req.params.id, req.body);
        return responseHandler.success(res, controller.ToResponse(data));
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//PATCH api/invoices/:id/status
router.patch("/:id/status", checkLogin, checkRole("ADMIN"), invoiceValidator.updateStatus, validate, async (req, res) => {
    try {
        const data = await controller.UpdateInvoiceStatus(req.params.id, req.query.status);
        return responseHandler.success(res, controller.ToResponse(data));
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});


//DELETE api/invoices/:id
router.delete("/:id", checkLogin, checkRole("ADMIN"), invoiceValidator.delete, validate, async (req, res) => {
    try {
        await controller.DeleteInvoice(req.params.id);
        return responseHandler.success(res, null, "Deleted");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

module.exports = router;