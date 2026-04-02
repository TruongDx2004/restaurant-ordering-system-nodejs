const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");

//GET api/users
router.get("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let users = await userController.GetAllUser();
        return responseHandler.success(res, users, "Users retrieved successfully");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Lấy chi tiết một người dùng
router.get("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let result = await userController.GetAnUserById(req.params.id);
        return responseHandler.success(res, result, "User retrieved successfully");
    } catch (err) {
        return responseHandler.error(res, err.message, 404);
    }
});

// Tạo người dùng mới
router.post("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        const { email, password, name, phone, role } = req.body;
        let newItem = await userController.CreateAnUser(email, password, name, phone, role);
        return responseHandler.success(res, newItem, "User created successfully");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Cập nhật người dùng
router.put("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        let updatedItem = await userController.UpdateAnUser(id, req.body);
        return responseHandler.success(res, updatedItem, "User updated successfully");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

// Xóa người dùng
router.delete("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id;
        await userController.DeleteAnUser(id);
        return responseHandler.success(res, null, "User deleted successfully");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

module.exports = router;
