const User = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");

module.exports = {
    CreateAnUser: async function (email, password, name, phone, role) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return await User.create({
            email,
            password: hashedPassword,
            name,
            phone,
            role
        });
    },

    GetAllUser: async function () {
        return await User.findAll();
    },

    GetAnUserById: async function (id) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("Khong tìm thấy người dùng");
        return user;
    },

    UpdateAnUser: async function (id, data) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("Khong tìm thấy người dùng");

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        return await user.update(data);
    },

    DeleteAnUser: async function (id) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("Khong tìm thấy người dùng");
        return await user.destroy();
    }
};
