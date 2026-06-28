// Roteador raiz da API. As rotas de cada recurso serão montadas aqui
// conforme o backend evoluir (ex.: auth, produtos, carrinho, pedidos).
const { Router } = require("express");

const router = Router();

// Exemplo de como montar rotas futuras:
// const authRoutes = require("./auth.routes");
// router.use("/auth", authRoutes);

module.exports = router;
