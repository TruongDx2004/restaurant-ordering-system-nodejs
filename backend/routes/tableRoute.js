const express = require("express");
const router = express.Router();

const tableController = require("../controllers/tableController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { tableValidator, validate } = require("../utils/validateHandler");
const responseHandler = require("../utils/responseHandler");

//POST api/tables
router.post("/", checkLogin, checkRole("ADMIN"), tableValidator.create, validate, async function (req, res, next) {
    try {
        const table = await tableController.CreateTable(req.body);
        return responseHandler.success(res, table, "Bàn được tạo thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//PUT api/tables/:id
router.put("/:id", checkLogin, checkRole("ADMIN"), tableValidator.update, validate, async function (req, res, next) {
    try {
        const table = await tableController.UpdateTable(req.params.id, req.body);
        return responseHandler.success(res, table, "Bàn được cập nhật thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//DELETE api/tables/:id
router.delete("/:id", checkLogin, checkRole("ADMIN"), tableValidator.idParam, validate, async function (req, res, next) {
    try {
        await tableController.DeleteTable(req.params.id);
        return responseHandler.success(res, null, "Bàn được xóa thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//PATCH api/tables/:id/status?status=AVAILABLE
router.patch("/:id/status", checkLogin, checkRole("ADMIN", "EMPLOYEE"), tableValidator.updateStatus, validate, async function (req, res, next) {
    try {
        let { status } = req.query;
        status = status.toUpperCase().trim();

        const table = await tableController.UpdateTableStatus(req.params.id, status);
        return responseHandler.success(res, table, "Trạng thái bàn được cập nhật thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//GET api/tables
router.get("/", checkLogin, async function (req, res, next) {
    try {
        const tables = await tableController.GetAllTables();
        return responseHandler.success(res, tables);
    } catch (err) {
        return responseHandler.error(res, err.message);
    }
});

//GET api/tables/active
router.get("/active", checkLogin, async function (req, res, next) {
    try {
        const tables = await tableController.GetActiveTables();
        return responseHandler.success(res, tables);
    } catch (err) {
        return responseHandler.error(res, err.message);
    }
});

//GET api/tables/number/:tableNumber
router.get("/number/:tableNumber", checkLogin, tableValidator.tableNumberParam, validate, async function (req, res, next) {
    try {
        const table = await tableController.GetTableByNumber(req.params.tableNumber);
        return responseHandler.success(res, table);
    } catch (err) {
        return responseHandler.error(res, err.message);
    }
});

//GET api/tables/status/:status
router.get("/status/:status", checkLogin, tableValidator.statusParam, validate, async function (req, res, next) {
    try {
        const tables = await tableController.GetTablesByStatus(req.params.status);
        return responseHandler.success(res, tables);
    } catch (err) {
        return responseHandler.error(res, err.message);
    }
});

//GET api/tables/area/:area
router.get("/area/:area", checkLogin, tableValidator.areaParam, validate, async function (req, res, next) {
    try {
        const tables = await tableController.GetTablesByArea(req.params.area);
        return responseHandler.success(res, tables);
    } catch (err) {
        return responseHandler.error(res, err.message);
    }
});

//GET api/tables/:id
router.get("/:id", tableValidator.idParam, validate, async function (req, res, next) {
    try {
        const table = await tableController.GetTableById(req.params.id);
        return responseHandler.success(res, table);
    } catch (err) {
        return responseHandler.error(res, err.message, 404);
    }
});

module.exports = router;