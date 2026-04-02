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
      type: DataTypes.STRING,
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
      type: DataTypes.JSON,
      allowNull: true
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
    tableName: "notifications",
    timestamps: true, 
    paranoid: true,
  }
);

module.exports = Notification;