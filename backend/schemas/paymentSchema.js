const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    invoiceId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      field: "invoice_id"
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    method: {
      type: DataTypes.ENUM("CASH", "VNPAY", "MOMO"),
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
      allowNull: false
    },

    paidAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "paid_at"
    },

    transactionCode: {
      type: DataTypes.STRING,
      field: "transaction_code"
    },

    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    },
    
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at"
    },

    deletedAt: {
      type: DataTypes.DATE,
      field: "deleted_at"
    }
  },
  {
    tableName: "payments",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Payment;