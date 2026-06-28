// Rota pública da página "Sobre".
const { Router } = require("express");

const aboutController = require("../controllers/about.controller");

const router = Router();

router.get("/", aboutController.obter);

module.exports = router;
