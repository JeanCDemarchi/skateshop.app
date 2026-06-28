// Controllers de autenticação: recebem a requisição (já validada pelo Zod),
// chamam o service e devolvem a resposta com o status HTTP correto.
const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const usuario = await authService.register(req.body);
  res.status(201).json(usuario);
});

const login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  res.status(200).json(resultado);
});

module.exports = { register, login };
