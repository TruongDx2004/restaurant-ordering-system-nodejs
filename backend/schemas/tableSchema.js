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
            field: "created_at",
            defaultValue: DataTypes.NOW
        },

        updatedAt: {
            type: DataTypes.DATE,
            field: "updated_at"
        }
    },
    {
        tableName: "tables",
        timestamps: false,

        hooks: {
            beforeCreate: (table) => {
                table.createdAt = new Date();
            },
            beforeUpdate: (table) => {
                table.updatedAt = new Date();
            }
        }
    }
);

module.exports = Table;