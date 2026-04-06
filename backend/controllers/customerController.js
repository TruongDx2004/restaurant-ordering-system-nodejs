const Customer = require("../schemas/customerSchema");
const bcrypt = require("bcrypt");

module.exports = {
    Register: async function (fullName, phone, password) {
        const existing = await Customer.findOne({ where: { phone } });
        if (existing) {
            throw new Error("Số điện thoại đã tồn tại");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const customer = await Customer.create({
            fullName,
            phone,
            password: hashedPassword,
            status: "ACTIVE"
        });
        return customer;
    },

    Login: async function (phone, password) {
        const customer = await Customer.findOne({ where: { phone } });
        if (!customer) {
            throw new Error("Số điện thoại hoặc mật khẩu không đúng");
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            throw new Error("Số điện thoại hoặc mật khẩu không đúng");
        }
        return customer;
    }

};