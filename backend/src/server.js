// Ponto de entrada: carrega variáveis de ambiente e sobe o servidor.
require("dotenv/config");

const app = require("./app");

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🛹 Servidor da Skateshop rodando em http://localhost:${PORT}`);
});
