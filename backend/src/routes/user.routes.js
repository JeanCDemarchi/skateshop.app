// Rotas do usuário logado. Todas protegidas e operam sobre req.usuario.id.
const { Router } = require("express");

const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { changePasswordSchema, updateProfileSchema } = require("../utils/userSchemas");
const userController = require("../controllers/user.controller");

const router = Router();

// Exige autenticação em todas as rotas deste módulo.
router.use(auth);

router.get("/me", userController.obterMe);
router.patch("/me/password", validate(changePasswordSchema), userController.alterarSenha);
router.patch("/me", validate(updateProfileSchema), userController.atualizarPerfil);

module.exports = router;
