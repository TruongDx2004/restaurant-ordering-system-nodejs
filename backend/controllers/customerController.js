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

        // check phone exists
        const existing = await Customer.findOne({ where: { phone } });
        if (existing) {
            return responseHandler.error(res, "Phone already exists", 400);
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
            "Customer registered successfully"
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
            return responseHandler.error(res, "Invalid phone or password", 400);
        }

        const isMatch = await bcrypt.compare(password, customer.password);

        if (!isMatch) {
            return responseHandler.error(res, "Invalid phone or password", 400);
        }

        // tạo JWT
        const token = authHandler.generateAccessToken({
            id: customer.id,
            role: "CUSTOMER"
        });

        return responseHandler.success(
            res,
            { accessToken: token },
            "Login successful"
        );

    } catch (err) {
        next(err);
    }
};