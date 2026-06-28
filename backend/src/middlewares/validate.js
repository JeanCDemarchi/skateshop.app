// Middleware de validação de corpo de requisição usando schemas Zod.
// Uso: router.post("/rota", validate(meuSchema), controller);
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        issues: result.error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensagem: issue.message,
        })),
      });
    }

    // Substitui o body pelos dados já validados/normalizados.
    req.body = result.data;
    return next();
  };
}

module.exports = validate;
