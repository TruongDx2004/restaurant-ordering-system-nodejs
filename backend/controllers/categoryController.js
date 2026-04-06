const Category = require("../schemas/categorySchema");

module.exports = {
  CreateCategory: async function (name) {
    return await Category.create({ name });
  },

  GetAllCategories: async function () {
    return await Category.findAll();
  },

  GetCategoryById: async function (id) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error("Không tìm thấy danh mục");
    return category;
  },

  GetCategoryByName: async function (name) {
    const category = await Category.findOne({ where: { name } });
    if (!category) throw new Error("Không tìm thấy danh mục");
    return category;
  },

  UpdateCategory: async function (id, data) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error("Không tìm thấy danh mục");
    return await category.update(data);
  },

  DeleteCategory: async function (id) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error("Không tìm thấy danh mục");
    return await category.destroy();
  }
};
