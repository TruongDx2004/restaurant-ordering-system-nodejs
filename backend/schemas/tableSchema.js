const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Table = sequelize.define(
  "Table",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "table_number"
    },

    area: {
      type: DataTypes.STRING,
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM("AVAILABLE", "OCCUPIED", "RESERVED"),
      allowNull: false
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "is_active",
      defaultValue: true
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
    tableName: "tables",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Table;