const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Dish = sequelize.define(
  "Dish",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM("AVAILABLE", "SOLD_OUT"),
      allowNull: false
    },

    image: {
      type: DataTypes.STRING(255)
    },

    categoryId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "category_id"
    }
  },
  {
    tableName: "dishes",
    timestamps: false
  }
);

module.exports = Dish;