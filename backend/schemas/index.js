const User = require("./userSchema");
const Table = require("./tableSchema");
const Category = require("./categorySchema");
const Dish = require("./dishSchema");
const Invoice = require("./invoiceSchema");
const InvoiceItem = require("./invoiceItemSchema");

// ===== ASSOCIATIONS =====

// Category - Dish
Category.hasMany(Dish, {
  foreignKey: "categoryId",
  as: "dishes"
});

Dish.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category"
});

// Table - Invoice
Table.hasMany(Invoice, { 
  foreignKey: "tableId",
  as: "invoices"
});

Invoice.belongsTo(Table, { 
  foreignKey: "tableId",
  as: "table"
});

// Invoice - InvoiceItem
Invoice.hasMany(InvoiceItem, {
  foreignKey: "invoiceId",
  as: "items"
});
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

// Dish - InvoiceItem
InvoiceItem.belongsTo(Dish, { 
  foreignKey: "dishId",
  as: "dish"
});
Dish.hasMany(InvoiceItem, { 
  foreignKey: "dishId",
  as: "invoiceItems"
});

module.exports = {
  User,
  Table,
  Category,
  Dish,
  Invoice,
  InvoiceItem
};