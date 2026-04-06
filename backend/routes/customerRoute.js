const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");
const authHandler = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");
const { validate, customerValidator } = require("../utils/validateHandler");

const sanitizeCustomer = (customer) => {
    const { password, ...rest } = customer.toJSON();
    return rest;
};

// POST api/customers/register
router.post("/register", customerValidator.register, validate, async function (req, res, next) {
    try {
        const { fullName, phone, password } = req.body;

        const customer = await customerController.Register(fullName, phone, password);

        return responseHandler.success(
            res,
            sanitizeCustomer(customer),
            "Đăng ký thành công"
        );

    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//POST api/customers/login
router.post("/login", customerValidator.login, validate, async function (req, res, next) {
    try {
        const { phone, password } = req.body;

        const customer = await customerController.Login(phone, password);

        const token = authHandler.generateAccessToken({
            id: customer.id,
            role: "CUSTOMER"
        });

        return responseHandler.success(
            res,
            {
                accessToken: token,
                customer: sanitizeCustomer(customer)
            },
            "Đăng nhập thành công"
        );

    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

module.exports = router;