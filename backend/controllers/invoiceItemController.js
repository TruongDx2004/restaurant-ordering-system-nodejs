const { Dish, InvoiceItem, Category, Invoice } = require("../schemas");
const sequelize = require("../config/db");
const webSocketService = require("../utils/socketHandler");
const notificationController = require("./notificationController");

// ===== MAPPER =====
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

module.exports = {

  CreateInvoiceItem: async function (data) {
    const { quantity, unitPrice } = data;

    if (!quantity || quantity <= 0) {
      throw new Error("Số lượng phải lớn hơn 0");
    }

    const totalPrice = unitPrice * quantity;

    return await InvoiceItem.create({
      ...data,
      totalPrice
    });
  },

  GetInvoiceItemById: async function (id) {
    const item = await InvoiceItem.findByPk(id, {
      include: [{
        model: Dish,
        as: "dish",
        include: [{ model: Category, as: "category" }]
      }]
    });

    if (!item) throw new Error("Không tìm thấy mục hóa đơn");
    return item;
  },

  GetAllInvoiceItems: async function () {
    return await InvoiceItem.findAll({
      include: [{
        model: Dish,
        as: "dish",
        include: [{ model: Category, as: "category" }]
      }]
    });
  },

  GetByInvoice: async function (invoiceId) {
    return await InvoiceItem.findAll({
      where: { invoiceId },
      include: [{
        model: Dish,
        as: "dish",
        include: [{ model: Category, as: "category" }]
      }]
    });
  },

  GetByDish: async function (dishId) {
    return await InvoiceItem.findAll({
      where: { dishId },
      include: [{
        model: Dish,
        as: "dish",
        include: [{ model: Category, as: "category" }]
      }]
    });
  },

  // ===== UPDATE =====
  UpdateInvoiceItem: async function (id, data) {
    const item = await InvoiceItem.findByPk(id);
    if (!item) throw new Error("Không tìm thấy mục hóa đơn");

    const { quantity, unitPrice } = data;

    const totalPrice = unitPrice * quantity;

    return await item.update({
      ...data,
      totalPrice
    });
  },

  UpdateQuantity: async function (id, quantity) {
    if (!quantity || quantity <= 0) {
      throw new Error("Số lượng phải lớn hơn 0");
    }

    const item = await InvoiceItem.findByPk(id);
    if (!item) throw new Error("Không tìm thấy mục hóa đơn");

    const totalPrice = item.unitPrice * quantity;

    return await item.update({ quantity, totalPrice });
  },

  // ===== DELETE =====
  DeleteInvoiceItem: async function (id) {
    const item = await InvoiceItem.findByPk(id);
    if (!item) throw new Error("Không tìm thấy mục hóa đơn");

    return await item.destroy();
  },

  // ===== ADD ITEM =====
  AddItemToInvoice: async function (invoiceId, dishId, quantity) {
    if (!quantity || quantity <= 0) {
      throw new Error("Số lượng phải lớn hơn 0");
    }

    const dish = await Dish.findByPk(dishId);
    const invoice = await Invoice.findByPk(invoiceId);

    if (!dish) throw new Error("Không tìm thấy món ăn");
    if (!invoice) throw new Error("Không tìm thấy hóa đơn");

    const unitPrice = dish.price;
    const totalPrice = unitPrice * quantity;

    const item = await InvoiceItem.create({
      invoiceId,
      dishId,
      quantity,
      unitPrice,
      totalPrice
    });

    // notify
    await notificationController.createAndSend({
      title: "Món mới được gọi",
      message: `Bàn ${invoice.tableId} gọi ${quantity}x ${dish.name}`,
      type: "NEW_ORDER",
      recipientType: "ALL",
      data: { invoiceId, tableId: invoice.tableId }
    });

    return item;
  },

  // ===== STATUS =====
  UpdateStatus: async function (id, status) {
    const t = await sequelize.transaction();

    try {
      status = status.toUpperCase().trim();

      const item = await InvoiceItem.findByPk(id, {
        include: [{ model: Invoice }],
        transaction: t
      });

      if (!item) throw new Error("Không tìm thấy mục hóa đơn");

      if (item.status === "SERVED") {
        throw new Error("Không thể cập nhật mục đã phục vụ");
      }

      if (item.status === "CANCELLED") {
        throw new Error("Không thể cập nhật mục đã hủy");
      }

      const oldStatus = item.status;

      await item.update({ status }, { transaction: t });

      if (status === "CANCELLED" && oldStatus !== "CANCELLED") {
        const invoice = item.Invoice;

        if (invoice) {
          let newTotal = (invoice.totalAmount || 0) - (item.totalPrice || 0);
          if (newTotal < 0) newTotal = 0;

          await invoice.update({ totalAmount: newTotal }, { transaction: t });
        }
      }

      await t.commit();

      // websocket
      if (item.Invoice) {
        webSocketService.sendInvoiceItemStatusUpdate(
          item.Invoice.id,
          item.id,
          status
        );
      }

      return item;

    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  ToResponse: toResponse
};