const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { validate, messageValidator } = require("../utils/validateHandler");

/**
 * ADMIN
 */
router.post("/", checkLogin, messageValidator.create, validate, messageController.createMessage);
router.put("/:id", checkLogin, messageValidator.update, validate, messageController.updateMessage);
router.delete("/:id", checkLogin, messageValidator.delete, validate, messageController.deleteMessage);

/**
 * AUTH USER
 */
router.get("/", checkLogin, messageController.getAllMessages);
router.get("/:id", checkLogin, messageValidator.getById, validate, messageController.getMessageById);
router.get("/invoice/:invoiceId", checkLogin, messageValidator.getByInvoice, validate, messageController.getMessagesByInvoice);
router.get("/table/:tableId", checkLogin, messageValidator.getByTable, validate, messageController.getMessagesByTable);
router.get("/table/:tableId/ordered", checkLogin, messageValidator.getByTableOrdered, validate, messageController.getMessagesByTableOrderedByDate);
router.get("/type/:messageType", checkLogin, messageValidator.getByType, validate, messageController.getMessagesByType);
router.get("/sender/:sender", checkLogin, messageValidator.getBySender, validate, messageController.getMessagesBySender);

/**
 * SEND
 */
router.post("/send-to-table", checkLogin, checkRole("ADMIN", "EMPLOYEE", "CUSTOMER"), messageValidator.send, validate, messageController.sendMessageToTable);

module.exports = router;