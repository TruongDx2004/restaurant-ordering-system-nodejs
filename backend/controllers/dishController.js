const Dish = require("../schemas/dishSchema");
const Category = require("../schemas/categorySchema");
const responseHandler = require("../utils/responseHandler");

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
    : null
});

const toEntity = (data, file, oldDish = null) => {
  let imageValue = oldDish?.image || null;

  if (file) {
    imageValue = `/uploads/${file.filename}`;
    console.log('Updating dish image:', imageValue);
  }
  return {
    name: data.name,
    price: parseInt(data.price),
    status: data.status,
    image: imageValue,
    categoryId: parseInt(data.categoryId)
  };
};

// ===== CONTROLLER =====

// CREATE
exports.createDish = async (req, res, next) => {
  try {
    const entity = toEntity(req.body, req.file);

    const created = await Dish.create(entity);

    return responseHandler.success(
      res,
      toResponse(created),
      "Dish created successfully"
    );
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getDishById = async (req, res, next) => {
  try {
    const dish = await Dish.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category"
        }
      ]
    });


    if (!dish) throw new Error("Dish not found");

    return responseHandler.success(
      res,
      toResponse(dish),
      "Dish retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

// GET ALL
exports.getAllDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.findAll({
      include: [
        {
          model: Category,
          as: "category"
        }
      ]
    });

    return responseHandler.success(
      res,
      dishes.map(toResponse),
      "Dishes retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateDish = async (req, res, next) => {
  try {
    const dish = await Dish.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category"
        }
      ]
    });

    if (!dish) throw new Error("Dish not found");

    const entity = toEntity(req.body, req.file, dish);

    await dish.update(entity);

    return responseHandler.success(
      res,
      toResponse(dish),
      "Dish updated successfully"
    );
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteDish = async (req, res, next) => {
  try {
    const dish = await Dish.findByPk(req.params.id);

    if (!dish) throw new Error("Dish not found");

    await dish.destroy();

    return responseHandler.success(
      res,
      null,
      "Dish deleted successfully"
    );
  } catch (err) {
    next(err);
  }
};

// GET BY STATUS
exports.getDishesByStatus = async (req, res, next) => {
  try {
    const dishes = await Dish.findAll({
      where: { status: req.params.status },
      include: [
        {
          model: Category,
          as: "category"
        }
      ]
    });

    return responseHandler.success(
      res,
      dishes.map(toResponse),
      "Dishes retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

// GET BY CATEGORY
exports.getDishesByCategory = async (req, res, next) => {
  try {
    const dishes = await Dish.findAll({
      where: { categoryId: req.params.categoryId },
      include: [
        {
          model: Category,
          as: "category"
        }
      ]
    });

    return responseHandler.success(
      res,
      dishes.map(toResponse),
      "Dishes retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

// SEARCH BY NAME
exports.searchDishesByName = async (req, res, next) => {
  try {
    const { name } = req.query;

    const dishes = await Dish.findAll({
      where: {
        name: {
          [require("sequelize").Op.like]: `%${name}%`
        }
      },
      include: [
        {
          model: Category,
          as: "category"
        }
      ]
    });

    return responseHandler.success(
      res,
      dishes.map(toResponse),
      "Dishes retrieved successfully"
    );
  } catch (err) {
    next(err);
  }
};

// UPDATE STATUS
exports.updateDishStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { status } = req.query;

    // 1. Validate status tồn tại
    if (!status) {
      throw new Error("Status is required");
    }

    // 2. Chuẩn hóa input (tránh client gửi sai format)
    status = status.toUpperCase().trim();

    const allowedStatus = ["AVAILABLE", "SOLD_OUT"];

    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid status value");
    }

    // 3. Check dish tồn tại
    const dish = await Dish.findByPk(id);
    if (!dish) throw new Error("Dish not found");

    // 4. Update
    await dish.update({ status });

    return responseHandler.success(
      res,
      toResponse(dish),
      "Dish status updated successfully"
    );
  } catch (err) {
    next(err);
  }
};