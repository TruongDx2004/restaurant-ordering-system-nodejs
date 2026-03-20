const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: "categories",
    timestamps: false,
  }
);

module.exports = Category;