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

    recipientType: {
      type: DataTypes.ENUM("USER", "CUSTOMER"),
      allowNull: false,
      field: "recipient_type"
    },

    recipientId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "recipient_id"
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    message: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },

    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_read"
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
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