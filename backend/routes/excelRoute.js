const express = require("express");
const router = express.Router();
const multer = require("multer");

const excelController = require("../controllers/excelController");
const responseHandler = require("../utils/responseHandler");
const { checkLogin, checkRole } = require("../utils/authHandler");

const upload = multer({ storage: multer.memoryStorage() });

//GET api/excel/export/:entity
router.get("/export/:entity", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    const workbook = await excelController.ExportData(req.params.entity);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.entity}_export.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    return responseHandler.error(res, err.message, 400);
  }
});

//POST api/excel/import/:entity
router.post("/import/:entity", checkLogin, checkRole("ADMIN"), upload.single("file"), async function (req, res, next) {
  try {
    const result = await excelController.ImportData(
      req.params.entity,
      req.file?.buffer
    );

    return responseHandler.success(
      res,
      result,
      `Import ${req.params.entity} thành công`
    );

  } catch (err) {
    return responseHandler.error(res, err.message, 500);
  }
});

module.exports = router;