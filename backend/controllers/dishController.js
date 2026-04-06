const Dish = require("../schemas/dishSchema");
const Category = require("../schemas/categorySchema");
const { Op } = require("sequelize");

// ===== MAPPER =====
const toResponse = (dish) => ({
  id: dish.id,
  name: dish.name,
  price: dish.price,
  status: dish.status,
  image: dish.image,
  category: dish.category
    ? {
      id: dish.category.id,
      name: dish.category.name
    }
    : dish.categoryId ? { id: dish.categoryId } : null,
});

const toEntity = (data, file, oldDish = null) => {
  let imageValue = oldDish?.image || null;

  if (file) {
    imageValue = `/uploads/${file.filename}`;
  }

  return {
    name: data.name,
    price: parseInt(data.price),
    status: data.status,
    image: imageValue,
    categoryId: parseInt(data.categoryId)
  };
};

module.exports = {

  CreateDish: async function (data, file) {
    const entity = toEntity(data, file);
    const dish = await Dish.create(entity);
    return dish;
  },

  GetDishById: async function (id) {
    const dish = await Dish.findByPk(id, {
      include: [{ model: Category, as: "category" }]
    });

    if (!dish) throw new Error("Không tìm thấy món ăn");
    return dish;
  },

  GetAllDishes: async function () {
    return await Dish.findAll({
      include: [{ model: Category, as: "category" }]
    });
  },

  UpdateDish: async function (id, data, file) {
    const dish = await Dish.findByPk(id, {
      include: [{ model: Category, as: "category" }]
    });

    if (!dish) throw new Error("Không tìm thấy món ăn");

    const entity = toEntity(data, file, dish);
    return await dish.update(entity);
  },

  DeleteDish: async function (id) {
    const dish = await Dish.findByPk(id);
    if (!dish) throw new Error("Không tìm thấy món ăn");

    return await dish.destroy();
  },

  GetDishesByStatus: async function (status) {
    return await Dish.findAll({
      where: { status },
      include: [{ model: Category, as: "category" }]
    });
  },

  GetDishesByCategory: async function (categoryId) {
    return await Dish.findAll({
      where: { categoryId },
      include: [{ model: Category, as: "category" }]
    });
  },

  SearchDishesByName: async function (name) {
    return await Dish.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`
        }
      },
      include: [{ model: Category, as: "category" }]
    });
  },

  UpdateDishStatus: async function (id, status) {
    if (!status) throw new Error("Yêu cầu trạng thái");

    status = status.toUpperCase().trim();

    const allowed = ["AVAILABLE", "SOLD_OUT"];
    if (!allowed.includes(status)) throw new Error("Trạng thái không hợp lệ");

    const dish = await Dish.findByPk(id);
    if (!dish) throw new Error("Không tìm thấy món ăn");

    return await dish.update({ status });
  },

  ToResponse: toResponse
};