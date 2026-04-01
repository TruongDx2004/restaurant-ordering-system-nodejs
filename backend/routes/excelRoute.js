const express = require('express');
const router = express.Router();
const multer = require('multer');
const excelController = require('../controllers/excelController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {checkLogin, checkRole} = require('../utils/authHandler');

router.get('/export/:entity',checkLogin, checkRole("ADMIN"), excelController.exportData);
router.post('/import/:entity',checkLogin, checkRole("ADMIN"), upload.single('file'), excelController.importData);

module.exports = router;
