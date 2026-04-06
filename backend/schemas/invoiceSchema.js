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
      field: "created_at"
    },

    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at"
    },

    paidAt: {
      type: DataTypes.DATE,
      field: "paid_at"
    },

    deletedAt: {
      type: DataTypes.DATE,
      field: "deleted_at"
    }
  },
  {
    tableName: "invoices",
    timestamps: true, 
    paranoid: true, 
  }
);

module.exports = Invoice;