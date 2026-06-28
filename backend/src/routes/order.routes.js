// Rotas de pedidos / checkout. Todas protegidas (exigem autenticação).
const { Router } = require("express");

const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createOrderSchema } = require("../utils/orderSchemas");
const pedidoController = require("../controllers/pedido.controller");

const router = Router();

// Aplica autenticação a todas as rotas deste módulo.
router.use(auth);

router.post("/", validate(createOrderSchema), pedidoController.criar);
router.get("/", pedidoController.listar);
router.get("/:id", pedidoController.obterPorId);

module.exports = router;
