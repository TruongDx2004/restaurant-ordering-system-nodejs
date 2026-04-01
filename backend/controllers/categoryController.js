const Category = require("../schemas/categorySchema");
const responseHandler = require("../utils/responseHandler");

// ===== MAPPER =====
const toResponse = (category) => ({
  id: category.id,
  name: category.name
});

const toEntity = (data) => ({
  name: data.name
});

// ===== CONTROLLER =====

// CREATE
exports.createCategory = async (req, res, next) => {
  try {
    const entity = toEntity(req.body);

    const created = await Category.create(entity);

    return responseHandler.success(
      res,
      toResponse(created),
      "Danh mục được tạo thành công"
    );
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) throw new Error("Category not found");

    return responseHandler.success(
      res,
      toResponse(category),
      "Danh mục được lấy thành công"
    );
  } catch (err) {
    next(err);
  }
};

// GET ALL
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();

    return responseHandler.success(
      res,
      categories.map(toResponse),
      "Danh mục được lấy thành công"
    );
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) throw new Error("Category not found");

    const entity = toEntity(req.body);

    await category.update(entity);

    return responseHandler.success(
      res,
      toResponse(category),
      "Danh mục chỉnh sửa thành công"
    );
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) throw new Error("Category not found");

    await category.destroy();

    return responseHandler.success(
      res,
      null,
      "Xóa danh mục thành công"
    );
  } catch (err) {
    next(err);
  }
};

// GET BY NAME
exports.getCategoryByName = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { name: req.params.name }
    });

    if (!category) throw new Error("Category not found");

    return responseHandler.success(
      res,
      toResponse(category),
      "Category retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};