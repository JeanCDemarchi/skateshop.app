// Rotas de autenticação.
const { Router } = require("express");

const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../utils/authSchemas");
const authController = require("../controllers/auth.controller");

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;
