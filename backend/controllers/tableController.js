const Table = require("../schemas/tableSchema");
const ApiResponse = require("../utils/responseHandler");

// CREATE
const createTable = async (req, res) => {
    try {
        const table = await Table.create(req.body);
        res.status(201).json(ApiResponse.success(table, "Table created"));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

// GET ALL
const getAllTables = async (req, res) => {
    try {
        const tables = await Table.findAll();
        res.json(ApiResponse.success(tables));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

// GET BY ID
const getTableById = async (req, res) => {
    try {
        const table = await Table.findByPk(req.params.id);

        if (!table) {
            return res.status(404).json(ApiResponse.error("Table not found"));
        }

        res.json(ApiResponse.success(table));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

// UPDATE
const updateTable = async (req, res) => {
    try {
        const table = await Table.findByPk(req.params.id);

        if (!table) {
            return res.status(404).json(ApiResponse.error("Table not found"));
        }

        await table.update(req.body);

        res.json(ApiResponse.success(table, "Updated"));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

// DELETE
const deleteTable = async (req, res) => {
    try {
        const table = await Table.findByPk(req.params.id);

        if (!table) {
            return res.status(404).json(ApiResponse.error("Table not found"));
        }

        await table.destroy();

        res.json(ApiResponse.success(null, "Deleted"));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

// GET BY NUMBER
const getTableByNumber = async (req, res) => {
    try {
        const table = await Table.findOne({
            where: { tableNumber: req.params.tableNumber }
        });

        res.json(ApiResponse.success(table));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

// GET BY STATUS
const getTablesByStatus = async (req, res) => {
    try {
        const tables = await Table.findAll({
            where: { status: req.params.status }
        });

        res.json(ApiResponse.success(tables));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

// GET BY AREA
const getTablesByArea = async (req, res) => {
    try {
        const tables = await Table.findAll({
            where: { area: req.params.area }
        });

        res.json(ApiResponse.success(tables));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

// UPDATE STATUS
const updateTableStatus = async (req, res) => {
    try {
        const table = await Table.findByPk(req.params.id);

        if (!table) {
            return res.status(404).json(ApiResponse.error("Table not found"));
        }

        table.status = req.query.status;
        await table.save();

        res.json(ApiResponse.success(table, "Status updated"));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

// GET ACTIVE
const getActiveTables = async (req, res) => {
    try {
        const tables = await Table.findAll({
            where: { isActive: true }
        });

        res.json(ApiResponse.success(tables));
    } catch (err) {
        res.status(500).json(ApiResponse.error(err.message));
    }
};

module.exports = {
    createTable,
    getAllTables,
    getTableById,
    updateTable,
    deleteTable,
    getTableByNumber,
    getTablesByStatus,
    getTablesByArea,
    updateTableStatus,
    getActiveTables
};