const Table = require("../schemas/tableSchema");
const responseHandler = require("../utils/responseHandler");

// ================= CREATE =================
exports.createTable = async (req, res, next) => {
  try {
    const table = await Table.create(req.body);

    return responseHandler.success(
      res,
      table,
      "Table created successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET ALL =================
exports.getAllTables = async (req, res, next) => {
  try {
    const tables = await Table.findAll();

    return responseHandler.success(
      res,
      tables,
      "Tables retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET BY ID =================
exports.getTableById = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);

    if (!table) {
      return responseHandler.error(res, "Table not found", 404);
    }

    return responseHandler.success(
      res,
      table,
      "Table retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= UPDATE =================
exports.updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);

    if (!table) {
      return responseHandler.error(res, "Table not found", 404);
    }

    await table.update(req.body);

    return responseHandler.success(
      res,
      table,
      "Table updated successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= DELETE =================
exports.deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);

    if (!table) {
      return responseHandler.error(res, "Table not found", 404);
    }

    await table.destroy();

    return responseHandler.success(
      res,
      null,
      "Table deleted successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET BY NUMBER =================
exports.getTableByNumber = async (req, res, next) => {
  try {
    const table = await Table.findOne({
      where: { tableNumber: req.params.tableNumber }
    });

    return responseHandler.success(
      res,
      table,
      "Table retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET BY STATUS =================
exports.getTablesByStatus = async (req, res, next) => {
  try {
    const tables = await Table.findAll({
      where: { status: req.params.status }
    });

    return responseHandler.success(
      res,
      tables,
      "Tables retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET BY AREA =================
exports.getTablesByArea = async (req, res, next) => {
  try {
    const tables = await Table.findAll({
      where: { area: req.params.area }
    });

    return responseHandler.success(
      res,
      tables,
      "Tables retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= UPDATE STATUS =================
exports.updateTableStatus = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);

    if (!table) {
      return responseHandler.error(res, "Table not found", 404);
    }

    let { status } = req.query;

    if (!status) {
      return responseHandler.error(res, "Status is required", 400);
    }

    status = status.toUpperCase().trim();

    await table.update({ status });

    return responseHandler.success(
      res,
      table,
      "Table status updated successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET ACTIVE =================
exports.getActiveTables = async (req, res, next) => {
  try {
    const tables = await Table.findAll({
      where: { isActive: true }
    });

    return responseHandler.success(
      res,
      tables,
      "Active tables retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};