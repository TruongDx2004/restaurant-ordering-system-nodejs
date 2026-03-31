const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    type: {
      type: DataTypes.STRING, // Ví dụ: CASH_PAYMENT_REQUEST, NEW_ORDER, etc.
      allowNull: false
    },

    recipientType: {
      type: DataTypes.ENUM("USER", "ROLE", "ALL"),
      field: "recipient_type",
      defaultValue: "ALL"
    },

    recipientId: {
      type: DataTypes.BIGINT,
      field: "recipient_id",
      allowNull: true
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      field: "is_read",
      defaultValue: false
    },

    data: {
      type: DataTypes.JSON, // Lưu metadata như invoiceId, tableId
      allowNull: true
    },

    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "notifications",
    timestamps: false
  }
);

module.exports = Notification;
