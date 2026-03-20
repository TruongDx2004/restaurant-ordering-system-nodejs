const User = require("./userSchema");
const Table = require("./tableSchema");
const Category = require("./categorySchema");
const Dish = require("./dishSchema");
const Invoice = require("./invoiceSchema");
const InvoiceItem = require("./invoiceItemSchema");

// ===== ASSOCIATIONS =====

// Category - Dish
Category.hasMany(Dish, { foreignKey: "categoryId" });
Dish.belongsTo(Category, { foreignKey: "categoryId" });

// Table - Invoice
Invoice.belongsTo(Table, { foreignKey: "tableId" });
Table.hasMany(Invoice, { foreignKey: "tableId" });

// Invoice - InvoiceItem
Invoice.hasMany(InvoiceItem, {
  foreignKey: "invoiceId",
  as: "items"
});
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

// Dish - InvoiceItem
InvoiceItem.belongsTo(Dish, { foreignKey: "dishId" });
Dish.hasMany(InvoiceItem, { foreignKey: "dishId" });

module.exports = {
  User,
  Table,
  Category,
  Dish,
  Invoice,
  InvoiceItem
};