const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authHandler = require("../utils/authHandler");
const responseHandler = require("../utils/responseHandler");

//POST api/auth/login
router.post("/login", async function (req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await authController.Login(email, password);

        const accessToken = authHandler.generateAccessToken(user);
        const refreshToken = authHandler.generateRefreshToken(user);

        await authController.UpdateRefreshToken(user.id, refreshToken);

        return responseHandler.success(res, {
            token: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }, "Login successful");
    } catch (err) {
        return responseHandler.error(res, err.message, 401);
    }
});

//POST api/auth/refresh-token
router.post("/refresh-token", async function (req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return responseHandler.error(res, "Lỗi khi đăng nhập", 400);

        const user = await authController.GetUserByRefreshToken(refreshToken);
        if (!user) return responseHandler.error(res, "Lỗi khi đăng nhập", 403);

        const newAccessToken = authHandler.generateAccessToken(user);
        return responseHandler.success(res, { accessToken: newAccessToken }, "Access token mới đã được tạo");
    } catch (err) {
        return responseHandler.error(res, err.message, 400);
    }
});

module.exports = router;
