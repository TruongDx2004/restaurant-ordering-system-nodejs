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

    invoiceId: {
      type: DataTypes.BIGINT,
      field: "invoiceid"
    },

    tableId: {
      type: DataTypes.BIGINT,
      field: "tableid"
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
    tableName: "messages",
    timestamps: true, 
    paranoid: true, 
  }
);

module.exports = Message;