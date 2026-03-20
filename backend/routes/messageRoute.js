const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const { verifyToken, requireRole } = require("../utils/authMiddleware");

/**
 * ADMIN
 */
router.post("/", verifyToken, messageController.createMessage);
router.put("/:id", verifyToken, messageController.updateMessage);
router.delete("/:id", verifyToken, messageController.deleteMessage);

/**
 * AUTH USER
 */
router.get("/", verifyToken, messageController.getAllMessages);
router.get("/:id", verifyToken, messageController.getMessageById);

router.get("/invoice/:invoiceId", verifyToken, messageController.getMessagesByInvoice);
router.get("/table/:tableId", verifyToken, messageController.getMessagesByTable);
router.get("/table/:tableId/ordered", verifyToken, messageController.getMessagesByTableOrderedByDate);

router.get("/type/:messageType", verifyToken, messageController.getMessagesByType);
router.get("/sender/:sender", verifyToken, messageController.getMessagesBySender);

/**
 * SEND
 */
router.post(
  "/send-to-table",
  verifyToken,
  requireRole("ADMIN", "EMPLOYEE", "CUSTOMER"),
  messageController.sendMessageToTable
);

module.exports = router;