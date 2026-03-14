const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },

        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        name: {
            type: DataTypes.STRING(100)
        },

        phone: {
            type: DataTypes.STRING(255)
        },

        role: {
            type: DataTypes.ENUM("ADMIN", "EMPLOYEE"),
            allowNull: false
        },

        refreshToken: {
            type: DataTypes.TEXT,
            field: "refresh_token"
        },

        createdAt: {
            type: DataTypes.DATE,
            field: "created_at",
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        updatedAt: {
            type: DataTypes.DATE,
            field: "updated_at"
        }
    },
    {
        tableName: "users",
        timestamps: false,

        hooks: {

            beforeCreate: (user) => {
                user.createdAt = new Date();
            },

            beforeUpdate: (user) => {
                user.updatedAt = new Date();
            }

        }
    }
);

module.exports = User;