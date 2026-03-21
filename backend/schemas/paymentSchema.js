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
      field: "paid_at",
      defaultValue: DataTypes.NOW
    },

    transactionCode: {
      type: DataTypes.STRING,
      field: "transaction_code"
    }
  },
  {
    tableName: "payments",
    timestamps: false
  }
);

module.exports = Payment;