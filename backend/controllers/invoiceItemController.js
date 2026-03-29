const { Dish, InvoiceItem, Category, Invoice } = require("../schemas")
const responseHandler = require("../utils/responseHandler");
const sequelize = require("../config/db");
const webSocketService = require("../utils/webSocketService"); // Import WebSocketService

// ===== mapper =====
const toResponse = (item) => ({
  id: item.id,
  invoiceId: item.invoiceId,
  dishId: item.dishId,
  quantity: item.quantity,
  unitPrice: Number(item.unitPrice),
  totalPrice: Number(item.totalPrice),
  status: item.status,
  note: item.note,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,

  // 👇 thêm phần trả về đầy đủ
  dish: item.dish
    ? {
      id: item.dish.id,
      name: item.dish.name,
      price: Number(item.dish.price),
      image: item.dish.image,
      status: item.dish.status,
      category: item.dish.category
        ? {
          id: item.dish.category.id,
          name: item.dish.category.name
        }
        : null
    }
    : null
});

// ================= CREATE =================
exports.createInvoiceItem = async (req, res, next) => {
  try {
    const { quantity, unitPrice } = req.body;

    const totalPrice = unitPrice * quantity;

    const item = await InvoiceItem.create({
      ...req.body,
      totalPrice
    });

    return responseHandler.success(
      res,
      toResponse(item),
      "Invoice item created successfully"
    );
  } catch (err) {
    next(err);
  }
};

// ================= GET BY ID =================
exports.getInvoiceItemById = async (req, res, next) => {
  try {
    const item = await InvoiceItem.findByPk(req.params.id, {
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
    });

    if (!item) {
      return responseHandler.error(res, "Invoice item not found", 404);
    }

    return responseHandler.success(res, toResponse(item), "Retrieved successfully");
  } catch (err) {
    next(err);
  }
};

// ================= GET ALL =================
exports.getAllInvoiceItems = async (req, res, next) => {
  try {
    const items = await InvoiceItem.findAll({
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
    });

    return responseHandler.success(
      res,
      items.map(toResponse),
      "Invoice items retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE =================
exports.updateInvoiceItem = async (req, res, next) => {
  try {
    const item = await InvoiceItem.findByPk(req.params.id);

    if (!item) {
      return responseHandler.error(res, "Invoice item not found", 404);
    }

    const { quantity, unitPrice, status } = req.body;

    const totalPrice = unitPrice * quantity;

    await item.update({
      ...req.body,
      totalPrice,
      status: status || item.status
    });

    return responseHandler.success(res, toResponse(item), "Updated successfully");
  } catch (err) {
    next(err);
  }
};

// ================= DELETE =================
exports.deleteInvoiceItem = async (req, res, next) => {
  try {
    const item = await InvoiceItem.findByPk(req.params.id);

    if (!item) {
      return responseHandler.error(res, "Invoice item not found", 404);
    }

    await item.destroy();

    return responseHandler.success(res, null, "Deleted successfully");
  } catch (err) {
    next(err);
  }
};

// ================= GET BY INVOICE =================
exports.getInvoiceItemsByInvoice = async (req, res, next) => {
  try {
    const items = await InvoiceItem.findAll({
      where: { invoiceId: req.params.invoiceId },
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
    });

    return responseHandler.success(
      res,
      items.map(toResponse),
      "Retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

// ================= GET BY DISH =================
exports.getInvoiceItemsByDish = async (req, res, next) => {
  try {
    const items = await InvoiceItem.findAll({
      where: { dishId: req.params.dishId },
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
    });

    return responseHandler.success(
      res,
      items.map(toResponse),
      "Retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE QUANTITY =================
exports.updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.query;

    if (!quantity || quantity <= 0) {
      return responseHandler.error(res, "Quantity must be > 0", 400);
    }

    const item = await InvoiceItem.findByPk(req.params.id);

    if (!item) {
      return responseHandler.error(res, "Invoice item not found", 404);
    }

    const totalPrice = item.unitPrice * quantity;

    await item.update({ quantity, totalPrice });

    return responseHandler.success(res, toResponse(item), "Quantity updated");
  } catch (err) {
    next(err);
  }
};

// ================= ADD ITEM TO INVOICE =================
exports.addItemToInvoice = async (req, res, next) => {
  try {
    const { invoiceId, dishId, quantity } = req.query;

    if (!quantity || quantity <= 0) {
      return responseHandler.error(res, "Quantity must be > 0", 400);
    }

    const dish = await Dish.findByPk(dishId);

    if (!dish) {
      return responseHandler.error(res, "Dish not found", 404);
    }

    const unitPrice = dish.price;
    const totalPrice = unitPrice * quantity;

    const item = await InvoiceItem.create({
      invoiceId,
      dishId,
      quantity,
      unitPrice,
      totalPrice
    });

    return responseHandler.success(res, toResponse(item), "Added successfully");
  } catch (err) {
    next(err);
  }
};

// ================= UPDATE STATUS =================
exports.updateStatus = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let { status } = req.query;
    status = status.toUpperCase().trim();

    const item = await InvoiceItem.findByPk(req.params.id, {
      include: [{ model: Invoice }],
      transaction: t
    });

    if (!item) {
      await t.rollback();
      return responseHandler.error(res, "Invoice item not found", 404);
    }

    // ❗ Validate flow
    if (item.status === "SERVED") {
      await t.rollback();
      return responseHandler.error(res, "Cannot update a served item", 400);
    }

    if (item.status === "CANCELLED") {
      await t.rollback();
      return responseHandler.error(res, "Cannot update a cancelled item", 400);
    }

    const oldStatus = item.status;

    // update item
    await item.update(
      {
        status,
        updatedAt: new Date()
      },
      { transaction: t }
    );

    // ================= BUSINESS LOGIC =================
    // Nếu chuyển sang CANCELLED thì trừ tiền invoice
    if (status === "CANCELLED" && oldStatus !== "CANCELLED") {
      const invoice = item.Invoice;

      if (invoice) {
        let currentTotal = invoice.totalAmount || 0;
        let itemPrice = item.totalPrice || 0;

        let newTotal = currentTotal - itemPrice;

        // đảm bảo không âm
        if (newTotal < 0) newTotal = 0;

        await invoice.update(
          { totalAmount: newTotal },
          { transaction: t }
        );
      }
    }

    await t.commit();

    // ================= WEBSOCKET =================
    if (item.Invoice) {
      webSocketService.sendInvoiceItemStatusUpdate(
        item.Invoice.id,
        item.id,
        status
      );
    }

    return responseHandler.success(res, item, "Status updated");
  } catch (err) {
    await t.rollback();
    next(err);
  }
};