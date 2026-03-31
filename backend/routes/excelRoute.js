const express = require('express');
const router = express.Router();
const multer = require('multer');
const excelController = require('../controllers/excelController');

// Multer config for memory storage (excel files aren't usually massive)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Route: /api/excel
 */

// Export data
router.get('/export/:entity', excelController.exportData);

// Import data
router.post('/import/:entity', upload.single('file'), excelController.importData);

module.exports = router;
