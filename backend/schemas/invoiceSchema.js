const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Invoice = sequelize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    tableId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "table_id"
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "total_amount"
    },

    status: {
      type: DataTypes.ENUM("OPEN", "PAID", "CANCELLED"),
      allowNull: false
    },

    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    },

    paidAt: {
      type: DataTypes.DATE,
      field: "paid_at"
    }
  },
  {
    tableName: "invoices",
    timestamps: false
  }
);

module.exports = Invoice;