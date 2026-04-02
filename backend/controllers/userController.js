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
        if (!user) throw new Error("id not found");
        return user;
    },

    UpdateAnUser: async function (id, data) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("id not found");

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        return await user.update(data);
    },

    DeleteAnUser: async function (id) {
        const user = await User.findByPk(id);
        if (!user) throw new Error("id not found");
        // Trong ví dụ của bạn là soft delete (isDeleted: true), 
        // nhưng schema hiện tại không có isDeleted nên tôi dùng destroy()
        // Hoặc nếu bạn muốn soft delete, hãy thêm isDeleted vào schema.
        return await user.destroy();
    }
};
