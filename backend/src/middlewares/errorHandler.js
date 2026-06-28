// Middlewares de rota não encontrada (404) e tratamento central de erros.
const multer = require("multer");

function notFound(req, res, next) {
  res.status(404).json({ error: "Rota não encontrada" });
}

// O Express identifica este como handler de erro pela assinatura de 4 args.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Erros do multer (ex.: arquivo grande, campo inesperado) e do fileFilter
  // são problemas do cliente → 400.
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  }
  if (err && err.message === "Apenas arquivos de imagem são permitidos") {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    error: err.message || "Erro interno do servidor",
  });
}

module.exports = { notFound, errorHandler };
