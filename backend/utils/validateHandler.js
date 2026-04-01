const { body, param, query, validationResult } = require("express-validator");

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

const categoryValidator = {
    create: [
        body("name")
            .trim()
            .notEmpty().withMessage("Tên danh mục không được để trống")
            .bail()
            .isLength({ min: 2, max: 255 }).withMessage("Tên phải từ 2-255 ký tự")
    ],

    update: [
        param("id")
            .isInt().withMessage("ID phải là số"),

        body("name")
            .optional()
            .trim()
            .notEmpty().withMessage("Tên không được rỗng")
            .isLength({ min: 2, max: 255 }).withMessage("Tên phải từ 2-255 ký tự")
    ],

    delete: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getById: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getByName: [
        param("name")
            .trim()
            .notEmpty().withMessage("Tên không được để trống")
            .isLength({ min: 2 }).withMessage("Tên quá ngắn")
    ]
};

const customerValidator = {

    register: [
        body("fullName")
            .trim()
            .notEmpty().withMessage("Họ tên không được để trống")
            .isLength({ min: 2 }).withMessage("Họ tên phải ít nhất 2 ký tự"),

        body("phone")
            .trim()
            .notEmpty().withMessage("Số điện thoại không được để trống")
            .matches(/^(0|\+84)[0-9]{9}$/).withMessage("Số điện thoại không hợp lệ"),

        body("password")
            .notEmpty().withMessage("Mật khẩu không được để trống")
            .isStrongPassword({
                minLength: 6, // có thể giảm cho UX mobile
                minLowercase: 1,
                minUppercase: 0,
                minNumbers: 1,
                minSymbols: 0
            }).withMessage("Mật khẩu phải >=6 ký tự và có ít nhất 1 số")
    ],

    login: [
        body("phone")
            .trim()
            .notEmpty().withMessage("Số điện thoại không được để trống"),

        body("password")
            .notEmpty().withMessage("Mật khẩu không được để trống")
    ]
};

const dishValidator = {

    create: [
        body("name")
            .trim()
            .notEmpty().withMessage("Tên món không được để trống")
            .isLength({ min: 2 }).withMessage("Tên món phải ít nhất 2 ký tự"),

        body("price")
            .notEmpty().withMessage("Giá không được để trống")
            .isInt({ min: 1000 }).withMessage("Giá phải là số và >= 1000"),

        body("status")
            .optional()
            .isIn(["AVAILABLE", "SOLD_OUT"])
            .withMessage("Trạng thái không hợp lệ"),

        body("categoryId")
            .notEmpty().withMessage("Category không được để trống")
            .isInt().withMessage("CategoryId phải là số")
    ],

    update: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        body("name")
            .optional()
            .trim()
            .notEmpty().withMessage("Tên không được rỗng")
            .isLength({ min: 2 }).withMessage("Tên phải ít nhất 2 ký tự"),

        body("price")
            .optional()
            .isInt({ min: 1000 }).withMessage("Giá phải >= 1000"),

        body("status")
            .optional()
            .isIn(["AVAILABLE", "SOLD_OUT"])
            .withMessage("Trạng thái không hợp lệ"),

        body("categoryId")
            .optional()
            .isInt().withMessage("CategoryId phải là số")
    ],

    delete: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getById: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getByStatus: [
        param("status")
            .notEmpty().withMessage("Trạng thái không được để trống")
            .isIn(["AVAILABLE", "SOLD_OUT"])
            .withMessage("Trạng thái không hợp lệ")
    ],

    getByCategory: [
        param("categoryId")
            .isInt().withMessage("CategoryId không hợp lệ")
    ],

    search: [
        query("name")
            .trim()
            .notEmpty().withMessage("Tên tìm kiếm không được để trống")
    ],

    updateStatus: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        query("status")
            .notEmpty().withMessage("Trạng thái không được để trống")
            .isIn(["AVAILABLE", "SOLD_OUT"])
            .withMessage("Trạng thái không hợp lệ")
    ]
};

const invoiceItemValidator = {

    create: [
        body("invoiceId")
            .notEmpty().withMessage("invoiceId không được để trống")
            .isInt().withMessage("invoiceId phải là số"),

        body("dishId")
            .notEmpty().withMessage("dishId không được để trống")
            .isInt().withMessage("dishId phải là số"),

        body("quantity")
            .notEmpty().withMessage("Số lượng không được để trống")
            .isInt({ min: 1 }).withMessage("Số lượng phải > 0"),

        body("unitPrice")
            .notEmpty().withMessage("unitPrice không được để trống")
            .isInt({ min: 0 }).withMessage("Giá phải >= 0"),

        body("note")
            .optional()
            .isLength({ max: 255 }).withMessage("Note quá dài")
    ],

    update: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        body("quantity")
            .optional()
            .isInt({ min: 1 }).withMessage("Số lượng phải > 0"),

        body("unitPrice")
            .optional()
            .isInt({ min: 0 }).withMessage("Giá phải >= 0"),

        body("status")
            .optional()
            .isIn(["PENDING", "CONFIRMED", "PREPARING", "SERVED", "CANCELLED"])
            .withMessage("Trạng thái không hợp lệ"),

        body("note")
            .optional()
            .isLength({ max: 255 }).withMessage("Note quá dài")
    ],

    delete: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getById: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getByInvoice: [
        param("invoiceId")
            .isInt().withMessage("invoiceId không hợp lệ")
    ],

    getByDish: [
        param("dishId")
            .isInt().withMessage("dishId không hợp lệ")
    ],

    updateQuantity: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        query("quantity")
            .notEmpty().withMessage("Quantity không được để trống")
            .isInt({ min: 1 }).withMessage("Quantity phải > 0")
    ],

    addItem: [
        query("invoiceId")
            .notEmpty().withMessage("invoiceId không được để trống")
            .isInt().withMessage("invoiceId phải là số"),

        query("dishId")
            .notEmpty().withMessage("dishId không được để trống")
            .isInt().withMessage("dishId phải là số"),

        query("quantity")
            .notEmpty().withMessage("quantity không được để trống")
            .isInt({ min: 1 }).withMessage("quantity phải > 0")
    ],

    updateStatus: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        query("status")
            .notEmpty().withMessage("Trạng thái không được để trống")
            .customSanitizer(val => val.toUpperCase().trim())
            .isIn(["PENDING", "CONFIRMED", "PREPARING", "SERVED", "CANCELLED"])
            .withMessage("Trạng thái không hợp lệ")
    ]
};

const invoiceValidator = {

    create: [
        body("tableId")
            .notEmpty().withMessage("tableId không được để trống")
            .bail()
            .isInt().withMessage("tableId phải là số"),

        body("status")
            .optional()
            .isIn(["OPEN", "PAID", "CANCELLED"])
            .withMessage("Trạng thái không hợp lệ"),

        body("totalAmount")
            .optional()
            .isFloat({ min: 0 }).withMessage("totalAmount phải >= 0")
    ],

    createWithItems: [
        body("tableId")
            .notEmpty().withMessage("tableId không được để trống")
            .bail()
            .isInt().withMessage("tableId phải là số"),

        body("items")
            .notEmpty().withMessage("Danh sách món không được để trống")
            .bail()
            .isArray({ min: 1 }).withMessage("Phải có ít nhất 1 món"),

        body("items.*.dishId")
            .notEmpty().withMessage("dishId không được để trống")
            .bail()
            .isInt().withMessage("dishId phải là số"),

        body("items.*.quantity")
            .notEmpty().withMessage("quantity không được để trống")
            .bail()
            .isInt({ min: 1 }).withMessage("quantity phải > 0"),

        body("items.*.status")
            .optional()
            .isIn(["WAITING", "PREPARING", "SERVED", "CANCELLED"])
            .withMessage("Trạng thái item không hợp lệ"),

        body("items.*.note")
            .optional()
            .isLength({ max: 255 }).withMessage("Note quá dài")
    ],

    getById: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getByStatus: [
        param("status")
            .notEmpty().withMessage("Status không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["OPEN", "PAID", "CANCELLED"])
            .withMessage("Trạng thái không hợp lệ")
    ],

    getByTable: [
        param("tableId")
            .isInt().withMessage("tableId không hợp lệ")
    ],

    getActiveByTable: [
        param("tableId")
            .isInt().withMessage("tableId không hợp lệ")
    ],

    getActiveByTableNumber: [
        param("tableNumber")
            .notEmpty().withMessage("tableNumber không được để trống")
    ],

    getByDateRange: [
        query("startDate")
            .notEmpty().withMessage("startDate không được để trống")
            .bail()
            .isISO8601().withMessage("startDate sai định dạng"),

        query("endDate")
            .notEmpty().withMessage("endDate không được để trống")
            .bail()
            .isISO8601().withMessage("endDate sai định dạng"),

        // 👇 điều kiện phụ thuộc (tiên quyết)
        query("endDate").custom((endDate, { req }) => {
            const start = new Date(req.query.startDate);
            const end = new Date(endDate);

            if (end < start) {
                throw new Error("endDate phải lớn hơn startDate");
            }
            return true;
        })
    ],

    update: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        body("status")
            .optional()
            .isIn(["OPEN", "PAID", "CANCELLED"])
            .withMessage("Trạng thái không hợp lệ"),

        body("totalAmount")
            .optional()
            .isFloat({ min: 0 }).withMessage("totalAmount phải >= 0")
    ],

    delete: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    updateStatus: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        query("status")
            .notEmpty().withMessage("Status không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["OPEN", "PAID", "CANCELLED"])
            .withMessage("Trạng thái không hợp lệ")
    ],

    calculateTotal: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ]
};

const messageValidator = {

    create: [
        body("tableId")
            .notEmpty().withMessage("tableId không được để trống")
            .bail()
            .isInt().withMessage("tableId phải là số"),

        body("content")
            .trim()
            .notEmpty().withMessage("Nội dung không được để trống")
            .isLength({ max: 500 }).withMessage("Nội dung quá dài"),

        body("sender")
            .notEmpty().withMessage("sender không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["STAFF", "CUSTOMER", "SYSTEM"])
            .withMessage("Sender không hợp lệ"),

        body("messageType")
            .optional()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["TEXT", "ORDER", "NOTIFICATION"])
            .withMessage("Loại message không hợp lệ"),

        body("invoiceId")
            .optional()
            .isInt().withMessage("invoiceId phải là số")
    ],

    update: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        body("content")
            .optional()
            .trim()
            .notEmpty().withMessage("Nội dung không được rỗng")
            .isLength({ max: 500 }).withMessage("Nội dung quá dài"),

        body("messageType")
            .optional()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["TEXT", "ORDER", "NOTIFICATION"])
            .withMessage("Loại message không hợp lệ")
    ],

    delete: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getById: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getByInvoice: [
        param("invoiceId")
            .isInt().withMessage("invoiceId không hợp lệ")
    ],

    getByTable: [
        param("tableId")
            .isInt().withMessage("tableId không hợp lệ")
    ],

    getByType: [
        param("messageType")
            .notEmpty().withMessage("messageType không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["TEXT", "ORDER", "NOTIFICATION"])
            .withMessage("Loại message không hợp lệ")
    ],

    getBySender: [
        param("sender")
            .notEmpty().withMessage("sender không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["STAFF", "CUSTOMER", "SYSTEM"])
            .withMessage("Sender không hợp lệ")
    ],

    getByTableOrdered: [
        param("tableId")
            .isInt().withMessage("tableId không hợp lệ")
    ],

    send: [
        query("tableId")
            .notEmpty().withMessage("tableId không được để trống")
            .bail()
            .isInt().withMessage("tableId phải là số"),

        query("content")
            .trim()
            .notEmpty().withMessage("Nội dung không được để trống")
            .isLength({ max: 500 }).withMessage("Nội dung quá dài"),

        query("sender")
            .notEmpty().withMessage("sender không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["STAFF", "CUSTOMER", "SYSTEM"])
            .withMessage("Sender không hợp lệ"),

        query("messageType")
            .optional()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["TEXT", "ORDER", "NOTIFICATION"])
            .withMessage("Loại message không hợp lệ")
    ]
};

const notificationValidator = {

    getAll: [],

    delete: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    markAsRead: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ],

    getByRecipient: [
        param("recipientType")
            .notEmpty().withMessage("recipientType không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["ALL", "TABLE", "USER"])
            .withMessage("recipientType không hợp lệ"),

        param("recipientId").custom((value, { req }) => {
            const type = req.params.recipientType;

            if (type !== "ALL") {
                if (!value) throw new Error("recipientId là bắt buộc");
                if (isNaN(value)) throw new Error("recipientId phải là số");
            }

            return true;
        })
    ],

    getUnread: [
        param("recipientType")
            .notEmpty().withMessage("recipientType không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["ALL", "TABLE", "USER"])
            .withMessage("recipientType không hợp lệ"),

        param("recipientId").custom((value, { req }) => {
            const type = req.params.recipientType;

            if (type !== "ALL") {
                if (!value) throw new Error("recipientId là bắt buộc");
                if (isNaN(value)) throw new Error("recipientId phải là số");
            }

            return true;
        })
    ],

    markAll: [
        query("recipientType")
            .optional()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["ALL", "TABLE", "USER"])
            .withMessage("recipientType không hợp lệ"),

        query("recipientId").custom((value, { req }) => {
            const type = req.query.recipientType;

            if (type && type !== "ALL") {
                if (!value) throw new Error("recipientId là bắt buộc");
                if (isNaN(value)) throw new Error("recipientId phải là số");
            }

            return true;
        })
    ]
};

const paymentValidator = {

    create: [
        body("invoiceId")
            .notEmpty().withMessage("invoiceId không được để trống")
            .bail()
            .isInt().withMessage("invoiceId phải là số"),

        body("amount")
            .notEmpty().withMessage("amount không được để trống")
            .bail()
            .isFloat({ min: 0 }).withMessage("amount phải >= 0"),

        body("method")
            .notEmpty().withMessage("method không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["CASH", "MOMO"])
            .withMessage("Phương thức thanh toán không hợp lệ"),

        body("status")
            .optional()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["PENDING", "SUCCESS", "FAILED"])
            .withMessage("Trạng thái không hợp lệ")
    ],

    update: [
        param("id").isInt().withMessage("ID không hợp lệ"),

        body("amount")
            .optional()
            .isFloat({ min: 0 }).withMessage("amount phải >= 0"),

        body("status")
            .optional()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["PENDING", "SUCCESS", "FAILED"])
            .withMessage("Trạng thái không hợp lệ")
    ],

    delete: [
        param("id").isInt().withMessage("ID không hợp lệ")
    ],

    getById: [
        param("id").isInt().withMessage("ID không hợp lệ")
    ],

    getByInvoice: [
        param("invoiceId").isInt().withMessage("invoiceId không hợp lệ")
    ],

    getByTransaction: [
        param("transactionCode")
            .notEmpty().withMessage("transactionCode không được để trống")
    ],

    getByStatus: [
        param("status")
            .notEmpty().withMessage("status không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["PENDING", "SUCCESS", "FAILED"])
            .withMessage("Trạng thái không hợp lệ")
    ],

    getByMethod: [
        param("method")
            .notEmpty().withMessage("method không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["CASH", "MOMO"])
            .withMessage("Phương thức không hợp lệ")
    ],

    updateStatus: [
        param("id").isInt().withMessage("ID không hợp lệ"),

        body("status")
            .notEmpty().withMessage("status không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["PENDING", "SUCCESS", "FAILED"])
            .withMessage("Trạng thái không hợp lệ")
    ],

    process: [
        query("invoiceId")
            .notEmpty().withMessage("invoiceId không được để trống")
            .bail()
            .isInt().withMessage("invoiceId phải là số"),

        query("method")
            .notEmpty().withMessage("method không được để trống")
            .bail()
            .customSanitizer(v => v.toUpperCase().trim())
            .isIn(["CASH", "MOMO"])
            .withMessage("Phương thức không hợp lệ"),

        query("amount")
            .notEmpty().withMessage("amount không được để trống")
            .bail()
            .isFloat({ min: 0 }).withMessage("amount phải >= 0")
    ],

    requestCash: [
        body("invoiceId")
            .notEmpty().withMessage("invoiceId không được để trống")
            .bail()
            .isInt().withMessage("invoiceId phải là số"),

        body("tableId")
            .notEmpty().withMessage("tableId không được để trống")
            .bail()
            .isInt().withMessage("tableId phải là số"),

        body("amount")
            .optional()
            .isFloat({ min: 0 }).withMessage("amount phải >= 0")
    ],

    confirm: [
        param("id").isInt().withMessage("ID không hợp lệ"),

        body("transactionCode")
            .optional()
            .isLength({ max: 255 }).withMessage("transactionCode quá dài")
    ],

    confirmByInvoice: [
        body("invoiceId")
            .notEmpty().withMessage("invoiceId không được để trống")
            .bail()
            .isInt().withMessage("invoiceId phải là số"),

        body("transactionCode")
            .optional()
            .isLength({ max: 255 }).withMessage("transactionCode quá dài")
    ],

    cancel: [
        param("id").isInt().withMessage("ID không hợp lệ")
    ],

    momo: [
        body("invoiceId")
            .notEmpty().withMessage("invoiceId không được để trống")
            .bail()
            .isInt().withMessage("invoiceId phải là số"),

        body("amount")
            .notEmpty().withMessage("amount không được để trống")
            .bail()
            .isFloat({ min: 1000 }).withMessage("amount tối thiểu 1000"),

        body("orderInfo")
            .optional()
            .isLength({ max: 255 }).withMessage("orderInfo quá dài")
    ],

    momoIPN: [
        body("orderId")
            .notEmpty().withMessage("orderId không được để trống"),

        body("resultCode")
            .notEmpty().withMessage("resultCode không được để trống")
    ]
};

const tableValidator = {
    create: [
        body("tableNumber")
            .notEmpty().withMessage("Số bàn không được để trống")
            .bail()
            .isInt({ min: 1 }).withMessage("Số bàn phải là số nguyên > 0"),

        body("area")
            .notEmpty().withMessage("Khu vực không được để trống")
            .bail()
            .isString().withMessage("Khu vực phải là chuỗi"),

        body("status")
            .optional()
            .isIn(["AVAILABLE", "OCCUPIED"])
            .withMessage("Trạng thái không hợp lệ"),

        body("isActive")
            .optional()
            .isBoolean().withMessage("isActive phải là boolean")
    ],

    update: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        body("tableNumber")
            .optional()
            .isInt({ min: 1 }).withMessage("Số bàn phải > 0"),

        body("area")
            .optional()
            .isString().withMessage("Khu vực phải là chuỗi"),

        body("status")
            .optional()
            .isIn(["AVAILABLE", "OCCUPIED"])
            .withMessage("Trạng thái không hợp lệ"),

        body("isActive")
            .optional()
            .isBoolean().withMessage("isActive phải là boolean")
    ],

    idParam: [
        param("id").isInt().withMessage("ID không hợp lệ")
    ],

    tableNumberParam: [
        param("tableNumber")
            .isInt({ min: 1 })
            .withMessage("Số bàn không hợp lệ")
    ],

    statusParam: [
        param("status")
            .notEmpty().withMessage("Status không được để trống")
            .bail()
            .isIn(["AVAILABLE", "OCCUPIED"])
            .withMessage("Trạng thái không hợp lệ")
    ],

    areaParam: [
        param("area")
            .notEmpty().withMessage("Khu vực không được để trống")
    ],

    updateStatus: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        query("status")
            .notEmpty().withMessage("Status không được để trống")
            .bail()
            .isIn(["AVAILABLE", "OCCUPIED"])
            .withMessage("Trạng thái không hợp lệ")
    ]
};

const userValidator = {
    create: [
        body("email")
            .notEmpty().withMessage("Email không được để trống")
            .bail()
            .isEmail().withMessage("Email không hợp lệ")
            .normalizeEmail(),

        body("password")
            .notEmpty().withMessage("Password không được để trống")
            .bail()
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }).withMessage("Password phải ≥8 ký tự, gồm hoa, thường, số, ký tự đặc biệt"),

        body("name")
            .notEmpty().withMessage("Tên không được để trống")
            .bail()
            .isString().withMessage("Tên phải là chuỗi"),

        body("phone")
            .notEmpty().withMessage("Số điện thoại không được để trống")
            .bail()
            .isMobilePhone("vi-VN").withMessage("Số điện thoại không hợp lệ"),

        body("role")
            .notEmpty().withMessage("Role không được để trống")
            .bail()
            .isIn(["ADMIN", "EMPLOYEE"])
            .withMessage("Role không hợp lệ")
    ],

    update: [
        param("id")
            .isInt().withMessage("ID không hợp lệ"),

        body("email")
            .optional()
            .isEmail().withMessage("Email không hợp lệ"),

        body("password")
            .optional()
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }).withMessage("Password phải ≥8 ký tự, gồm hoa, thường, số, ký tự đặc biệt"),

        body("name")
            .optional()
            .isString().withMessage("Tên phải là chuỗi"),

        body("phone")
            .optional()
            .isMobilePhone("vi-VN").withMessage("Số điện thoại không hợp lệ"),

        body("role")
            .optional()
            .isIn(["ADMIN", "EMPLOYEE"])
            .withMessage("Role không hợp lệ")
    ],

    idParam: [
        param("id")
            .isInt().withMessage("ID không hợp lệ")
    ]
};

const authValidator = {
    register: [
        body("email")
            .notEmpty().withMessage("Email không được để trống")
            .bail()
            .isEmail().withMessage("Email không hợp lệ")
            .normalizeEmail(),

        body("password")
            .notEmpty().withMessage("Password không được để trống")
            .bail()
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }).withMessage("Password phải ≥8 ký tự, gồm hoa, thường, số, ký tự đặc biệt"),

        body("name")
            .notEmpty().withMessage("Tên không được để trống")
            .bail()
            .isString().withMessage("Tên phải là chuỗi"),

        body("phone")
            .notEmpty().withMessage("SĐT không được để trống")
            .bail()
            .isMobilePhone("vi-VN").withMessage("SĐT không hợp lệ")
    ],

    login: [
        body("email")
            .notEmpty().withMessage("Email không được để trống")
            .bail()
            .isEmail().withMessage("Email không hợp lệ"),

        body("password")
            .notEmpty().withMessage("Password không được để trống")
    ],

    refreshToken: [
        body("refreshToken")
            .notEmpty().withMessage("Refresh token không được để trống")
            .bail()
            .isString().withMessage("Refresh token không hợp lệ")
    ]
};

module.exports = {
    validate,
    categoryValidator,
    customerValidator,
    dishValidator,
    invoiceItemValidator,
    invoiceValidator,
    messageValidator,
    notificationValidator,
    paymentValidator,
    tableValidator,
    userValidator,
    authValidator
};