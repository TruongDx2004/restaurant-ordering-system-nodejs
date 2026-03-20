const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const InvoiceItem = sequelize.define(
  "InvoiceItem",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    invoiceId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "invoice_id"
    },

    dishId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "dish_id"
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "unit_price"
    },

    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "total_price"
    },

    status: {
      type: DataTypes.ENUM("WAITING", "PREPARING", "SERVED", "CANCELLED"),
      allowNull: false,
      defaultValue: "WAITING"
    },

    note: {
      type: DataTypes.TEXT
    },

    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    },

    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "invoice_items",
    timestamps: false,

    hooks: {
      beforeUpdate: (item) => {
        item.updatedAt = new Date();
      }
    }
  }
);

module.exports = InvoiceItem;