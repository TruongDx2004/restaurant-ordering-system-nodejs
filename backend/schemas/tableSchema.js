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
        }
    },
    {
        tableName: "tables",
        timestamps: false,
    }
);

module.exports = Table;