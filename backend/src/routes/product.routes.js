// Rotas de produtos.
const { Router } = require("express");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const { createProductSchema, updateProductSchema } = require("../utils/productSchemas");
const productController = require("../controllers/product.controller");

const router = Router();

// IMPORTANTE: rotas específicas ANTES de "/:id", senão o Express trataria
// "search" e "suggestions" como um :id.
router.get("/search", productController.buscar);
router.get("/suggestions", productController.sugestoes);
router.get("/", productController.listar);
router.get("/:id", productController.obterPorId);

// Criação de produto — apenas admin. Ordem dos middlewares:
// auth -> admin -> recebe arquivos (multer) -> valida campos de texto -> controller.
router.post(
  "/",
  auth,
  admin,
  upload.array("imagens"),
  validate(createProductSchema),
  productController.criar
);

// Edição de produto — apenas admin. Aceita JSON ou multipart (novas imagens).
router.put(
  "/:id",
  auth,
  admin,
  upload.array("imagens"),
  validate(updateProductSchema),
  productController.editar
);

// Exclusão de produto — apenas admin.
router.delete("/:id", auth, admin, productController.excluir);

module.exports = router;
