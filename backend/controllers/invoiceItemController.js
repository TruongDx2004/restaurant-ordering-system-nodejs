const { Dish, InvoiceItem, Category } = require("../schemas")
const responseHandler = require("../utils/responseHandler");

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
  try {
    let { status } = req.query;

    const item = await InvoiceItem.findByPk(req.params.id);

    if (!item) {
      return responseHandler.error(res, "Invoice item not found", 404);
    }

    status = status.toUpperCase().trim();

    if (item.status === "SERVED" || item.status === "CANCELLED") {
      return responseHandler.error(res, "Cannot update this item", 400);
    }

    await item.update({ status });

    return responseHandler.success(res, toResponse(item), "Status updated");
  } catch (err) {
    next(err);
  }
};