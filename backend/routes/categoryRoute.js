const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");

//GET api/categories
router.get("/", async function (req, res, next) {
    try {
        const categories = await categoryController.GetAllCategories();
        return responseHandler.success(res, categories, "Danh mục được lấy thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//GET api/categories/:id
router.get("/:id", async function (req, res, next) {
    try {
        const category = await categoryController.GetCategoryById(req.params.id);
        return responseHandler.success(res, category, "Danh mục được lấy thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 404);
    }
});

//GET api/categories/name/:name
router.get("/name/:name", async function (req, res, next) {
    try {
        const category = await categoryController.GetCategoryByName(req.params.name);
        return responseHandler.success(res, category, "Danh mục được lấy thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 404);
    }
});

//POST api/categories
router.post("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        const { name } = req.body;
        const newCategory = await categoryController.CreateCategory(name);
        return responseHandler.success(res, newCategory, "Danh mục được tạo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//PUT api/categories/:id
router.put("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        const updatedCategory = await categoryController.UpdateCategory(req.params.id, req.body);
        return responseHandler.success(res, updatedCategory, "Danh mục chỉnh sửa thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//DELETE api/categories/:id
router.delete("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
    try {
        await categoryController.DeleteCategory(req.params.id);
        return responseHandler.success(res, null, "Xóa danh mục thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

module.exports = router;
