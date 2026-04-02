const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { checkLogin } = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");

//POST api/messages
router.post("/", checkLogin, async function (req, res, next) {
    try {
        const msg = await messageController.CreateMessage(req.body);
        return responseHandler.success(res, msg, "Message sent successfully");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//Get api/messages/conversations
router.get("/conversations", checkLogin, async function (req, res, next) {
    try {
        const data = await messageController.GetConversations();
        return responseHandler.success(res, data, "Conversations retrieved successfully");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//Get api/messages/table/:tableId
router.get("/table/:tableId", checkLogin, async function (req, res, next) {
    try {
        const data = await messageController.GetMessagesByTable(req.params.tableId);
        return responseHandler.success(res, data, "Messages retrieved successfully");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//DELETE api/messages/:id
router.delete("/:id", checkLogin, async function (req, res, next) {
    try {
        await messageController.DeleteMessage(req.params.id);
        return responseHandler.success(res, null, "Deleted");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

module.exports = router;
