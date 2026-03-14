const express = require('express');
const router = express.Router();

const responseHandler = require('../utils/responseHandler');
const db = require('../config/db');

/**
 * GET /
 * Test server + database connection
 */
router.get('/', async (req, res, next) => {

    try {

        const [rows] = await db.query('SELECT 1');

        return responseHandler.success(
            res,
            { database: "connected" },
            "Restaurant Ordering API running"
        );

    } catch (error) {

        next(error);

    }

});

module.exports = router;