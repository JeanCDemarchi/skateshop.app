// Configuração da aplicação Express.
const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const aboutRoutes = require("./routes/about.routes");
const userRoutes = require("./routes/user.routes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

// CORS — permite que o frontend (Expo/React Native) consuma a API.
// Em desenvolvimento liberamos todas as origens (origin: "*").
// Em produção, restrinja ao domínio do app, por exemplo:
//   app.use(cors({ origin: "https://seu-dominio.com" }));
// ou use uma lista vinda de variável de ambiente:
//   app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
app.use(cors({ origin: "*" }));
app.use(express.json());

// Healthcheck — verifica se o servidor está no ar.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Rotas de autenticação
app.use("/auth", authRoutes);

// Rotas de produtos
app.use("/products", productRoutes);

// Rotas de pedidos / checkout
app.use("/orders", orderRoutes);

// Página "Sobre" (pública)
app.use("/about", aboutRoutes);

// Usuário logado (perfil e senha)
app.use("/users", userRoutes);

// Rotas da API
app.use("/api", routes);

// Rota não encontrada e tratamento de erros (sempre por último).
app.use(notFound);
app.use(errorHandler);

module.exports = app;
