const express = require("express");
const router = express.Router();

const controller = require("../controllers/userController");
const { checkLogin, checkRole } = require("../utils/authHandler");
const { userValidator, validate } = require("../utils/validateHandler");

router.post("/", checkLogin, checkRole("ADMIN"), userValidator.create, validate, controller.createUser);
router.get("/", checkLogin, checkRole("ADMIN"), controller.getAllUsers);
router.get("/:id", checkLogin, checkRole("ADMIN"), userValidator.idParam, validate, controller.getUserById);
router.put("/:id", checkLogin, checkRole("ADMIN"), userValidator.update, validate, controller.updateUser);
router.delete("/:id", checkLogin, checkRole("ADMIN"), userValidator.idParam, validate, controller.deleteUser);

module.exports = router;