const Message = require("../schemas/messageSchema");
const responseHandler = require("../utils/responseHandler");

// sanitize (có thể bỏ nếu không cần)
const sanitizeMessage = (msg) => {
  return msg.toJSON();
};

// ================= CREATE =================
exports.createMessage = async (req, res, next) => {
  try {
    const message = await Message.create(req.body);

    return responseHandler.success(
      res,
      sanitizeMessage(message),
      "Message created successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET BY ID =================
exports.getMessageById = async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return responseHandler.error(res, "Message not found", 404);
    }

    return responseHandler.success(
      res,
      sanitizeMessage(message),
      "Message retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= GET ALL =================
exports.getAllMessages = async (req, res, next) => {
  try {
    const messages = await Message.findAll();

    return responseHandler.success(
      res,
      messages.map(sanitizeMessage),
      "Messages retrieved successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= UPDATE =================
exports.updateMessage = async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return responseHandler.error(res, "Message not found", 404);
    }

    await message.update(req.body);

    return responseHandler.success(
      res,
      sanitizeMessage(message),
      "Message updated successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= DELETE =================
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return responseHandler.error(res, "Message not found", 404);
    }

    await message.destroy();

    return responseHandler.success(
      res,
      null,
      "Message deleted successfully"
    );

  } catch (err) {
    next(err);
  }
};

// ================= FILTER =================

// by invoice
exports.getMessagesByInvoice = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: { invoiceId: req.params.invoiceId }
    });

    return responseHandler.success(res, messages, "OK");
  } catch (err) {
    next(err);
  }
};

// by table
exports.getMessagesByTable = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: { tableId: req.params.tableId }
    });

    return responseHandler.success(res, messages, "OK");
  } catch (err) {
    next(err);
  }
};

// by type
exports.getMessagesByType = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: { messageType: req.params.messageType }
    });

    return responseHandler.success(res, messages, "OK");
  } catch (err) {
    next(err);
  }
};

// by sender
exports.getMessagesBySender = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: { sender: req.params.sender }
    });

    return responseHandler.success(res, messages, "OK");
  } catch (err) {
    next(err);
  }
};

// ordered by date
exports.getMessagesByTableOrderedByDate = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: { tableId: req.params.tableId },
      order: [["created_at", "ASC"]]
    });

    return responseHandler.success(res, messages, "OK");
  } catch (err) {
    next(err);
  }
};

// send message
exports.sendMessageToTable = async (req, res, next) => {
  try {
    const { tableId, content, messageType, sender } = req.query;

    const message = await Message.create({
      tableId,
      content,
      messageType,
      sender
    });

    return responseHandler.success(
      res,
      message,
      "Message sent successfully"
    );

  } catch (err) {
    next(err);
  }
};