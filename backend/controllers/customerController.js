const Customer = require("../schemas/customerSchema");
const bcrypt = require("bcrypt");
const authHandler = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");

// remove password
const sanitizeCustomer = (customer) => {
    const { password, ...rest } = customer.toJSON();
    return rest;
};

// ================= REGISTER =================
exports.register = async (req, res, next) => {
    try {
        const { fullName, phone, password } = req.body;

        // kiểm tra phone tồn tại
        const existing = await Customer.findOne({ where: { phone } });
        if (existing) {
            return responseHandler.error(res, "Số điện thoại đã tồn tại", 400);
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            fullName,
            phone,
            password: hashedPassword,
            status: "ACTIVE"
        });

        return responseHandler.success(
            res,
            sanitizeCustomer(customer),
            "Đăng ký thành công"
        );

    } catch (err) {
        next(err);
    }
};

// ================= LOGIN =================
exports.login = async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        const customer = await Customer.findOne({ where: { phone } });

        if (!customer) {
            return responseHandler.error(res, "Số điện thoại hoặc mật khẩu không đúng", 400);
        }

        const isMatch = await bcrypt.compare(password, customer.password);

        if (!isMatch) {
            return responseHandler.error(res, "Số điện thoại hoặc mật khẩu không đúng", 400);
        }

        // tạo JWT
        const token = authHandler.generateAccessToken({
            id: customer.id,
            role: "CUSTOMER"
        });

        return responseHandler.success(
            res,
            { accessToken: token },
            "Đăng nhập thành công"
        );

    } catch (err) {
        next(err);
    }
};