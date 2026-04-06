const express = require("express");
const router = express.Router();

const dishController = require("../controllers/dishController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { validate, dishValidator } = require("../utils/validateHandler");
const responseHandler = require("../utils/responseHandler");
const upload = require("../utils/upload");

//POST api/dishes
router.post("/", checkLogin, checkRole("ADMIN"), upload.single("image"), dishValidator.create, validate, async function (req, res, next) {
  try {
    const dish = await dishController.CreateDish(req.body, req.file);
    return responseHandler.success(res, dishController.ToResponse(dish), "Món ăn được tạo thành công");
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//PUT api/dishes/:id
router.put("/:id", checkLogin, checkRole("ADMIN"), upload.single("image"), dishValidator.update, validate, async function (req, res, next) {
  try {
    const dish = await dishController.UpdateDish(req.params.id, req.body, req.file);
    return responseHandler.success(res, dishController.ToResponse(dish), "Chỉnh sửa món ăn thành công");
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//DELETE api/dishes/:id
router.delete("/:id", checkLogin, checkRole("ADMIN"), dishValidator.delete, validate, async function (req, res, next) {
  try {
    await dishController.DeleteDish(req.params.id);
    return responseHandler.success(res, null, "Xóa món ăn thành công");
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//PATCH api/dishes/:id/status
router.patch("/:id/status", checkLogin, checkRole("ADMIN"), dishValidator.updateStatus, validate, async function (req, res, next) {
  try {
    const dish = await dishController.UpdateDishStatus(req.params.id, req.query.status);
    return responseHandler.success(res, dishController.ToResponse(dish), "Cập nhật trạng thái thành công");
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//GET api/dishes
router.get("/", async function (req, res, next) {
  try {
    const dishes = await dishController.GetAllDishes();
    return responseHandler.success(res, dishes.map(dishController.ToResponse));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//GET api/dishes/status/:status
router.get("/status/:status", async function (req, res, next) {
  try {
    const dishes = await dishController.GetDishesByStatus(req.params.status);
    return responseHandler.success(res, dishes.map(dishController.ToResponse));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//GET api/dishes/category/:categoryId
router.get("/category/:categoryId", async function (req, res, next) {
  try {
    const dishes = await dishController.GetDishesByCategory(req.params.categoryId);
    return responseHandler.success(res, dishes.map(dishController.ToResponse));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//GET api/dishes/search?name=
router.get("/search", async function (req, res, next) {
  try {
    const dishes = await dishController.SearchDishesByName(req.query.name);
    return responseHandler.success(res, dishes.map(dishController.ToResponse));
  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//GET api/dishes/:id
router.get("/:id", async function (req, res, next) {
  try {
    const dish = await dishController.GetDishById(req.params.id);
    return responseHandler.success(res, dishController.ToResponse(dish));
  } catch (err) {
    return responseHandler.error(res, err.message, 404);
  }
});

module.exports = router;