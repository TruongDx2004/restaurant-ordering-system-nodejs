const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { checkLogin } = require("../utils/authHandler");
const { validate, messageValidator } = require("../utils/validateHandler");
const responseHandler = require("../utils/responseHandler");

//POST api/messages
router.post("/", messageValidator.create, validate, async function (req, res, next) {
    try {
        const msg = await messageController.CreateMessage(req.body);
        return responseHandler.success(res, msg, "Tin nhắn được gửi thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//Get api/messages/conversations
router.get("/conversations", checkLogin, async function (req, res, next) {
    try {
        const data = await messageController.GetConversations();
        return responseHandler.success(res, data, "Cuộc trò chuyện được lấy thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//Get api/messages/table/:tableId
router.get("/table/:tableId", checkLogin, messageValidator.getByTable, validate, async function (req, res, next) {
    try {
        const data = await messageController.GetMessagesByTable(req.params.tableId);
        return responseHandler.success(res, data, "Tin nhắn được lấy thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

//DELETE api/messages/:id
router.delete("/:id", checkLogin, messageValidator.delete, validate, async function (req, res, next) {
    try {
        await messageController.DeleteMessage(req.params.id);
        return responseHandler.success(res, null, "Tin nhắn được xóa thành công");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

module.exports = router;
