const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "full_name"
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ACTIVE"
    },

    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "customer",
    timestamps: false
  }
);

module.exports = Customer;