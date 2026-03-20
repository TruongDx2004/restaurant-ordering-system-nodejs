const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: "messageid"
    },

    content: {
      type: DataTypes.TEXT
    },

    messageType: {
      type: DataTypes.ENUM(
        "TEXT",
        "IMAGE",
        "QUICK_ACTION",
        "CALL_WAITER",
        "SYSTEM",
        "REQUEST_BILL"
      ),
      allowNull: false,
      field: "message_type"
    },

    sender: {
      type: DataTypes.ENUM("CUSTOMER", "STAFF", "SYSTEM"),
      allowNull: false
    },

    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    },

    invoiceId: {
      type: DataTypes.BIGINT,
      field: "invoiceid"
    },

    tableId: {
      type: DataTypes.BIGINT,
      field: "tableid"
    }
  },
  {
    tableName: "messages",
    timestamps: false
  }
);

module.exports = Message;