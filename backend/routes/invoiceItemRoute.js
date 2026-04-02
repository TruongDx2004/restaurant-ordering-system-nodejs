const express = require("express");
const router = express.Router();

const controller = require("../controllers/invoiceItemController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { validate, invoiceItemValidator } = require("../utils/validateHandler");
const responseHandler = require("../utils/responseHandler");

// ===== CREATE =====
router.post("/", invoiceItemValidator.create, validate, async function (req, res, next) {
  try {
    const item = await controller.CreateInvoiceItem(req.body);
    return responseHandler.success(res, controller.ToResponse(item));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

router.post("/add-to-invoice", invoiceItemValidator.addItem, validate, async function (req, res, next) {
  try {
    const { invoiceId, dishId, quantity } = req.query;
    const item = await controller.AddItemToInvoice(invoiceId, dishId, quantity);
    return responseHandler.success(res, controller.ToResponse(item));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

// ===== GET =====
router.get("/", checkLogin, async function (req, res, next) {
  try {
    const data = await controller.GetAllInvoiceItems();
    return responseHandler.success(res, data.map(controller.ToResponse));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

router.get("/invoice/:invoiceId", checkLogin, invoiceItemValidator.getByInvoice, validate, async function (req, res, next) {
  try {
    const data = await controller.GetByInvoice(req.params.invoiceId);
    return responseHandler.success(res, data.map(controller.ToResponse));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//GET api/invoice-items/dish/:dishId
router.get("/dish/:dishId", checkLogin, invoiceItemValidator.getByDish, validate, async function (req, res, next) {
  try {
    const data = await controller.GetByDish(req.params.dishId);
    return responseHandler.success(res, data.map(controller.ToResponse));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

router.get("/:id", checkLogin, invoiceItemValidator.getById, validate, async function (req, res, next) {
  try {
    const data = await controller.GetInvoiceItemById(req.params.id);
    return responseHandler.success(res, controller.ToResponse(data));
  } catch (err) {
    return responseHandler.error(res, err.message, 404);
  }
});

// ===== UPDATE =====
router.put("/:id", checkLogin, invoiceItemValidator.update, validate, async function (req, res, next) {
  try {
    const data = await controller.UpdateInvoiceItem(req.params.id, req.body);
    return responseHandler.success(res, controller.ToResponse(data));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

router.patch("/:id/quantity", invoiceItemValidator.updateQuantity, validate, async function (req, res, next) {
  try {
    const data = await controller.UpdateQuantity(req.params.id, req.query.quantity);
    return responseHandler.success(res, controller.ToResponse(data));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

router.patch("/:id/status", checkLogin, invoiceItemValidator.updateStatus, validate, async function (req, res, next) {
  try {
    const data = await controller.UpdateStatus(req.params.id, req.query.status);
    return responseHandler.success(res, controller.ToResponse(data));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

// ===== DELETE =====
router.delete("/:id", checkLogin, checkRole("ADMIN"), invoiceItemValidator.delete, validate, async function (req, res, next) {
  try {
    await controller.DeleteInvoiceItem(req.params.id);
    return responseHandler.success(res, null, "Deleted");
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

module.exports = router;