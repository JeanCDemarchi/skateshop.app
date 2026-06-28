// Controllers do usuário logado.
const userService = require("../services/user.service");
const asyncHandler = require("../utils/asyncHandler");

const obterMe = asyncHandler(async (req, res) => {
  const usuario = await userService.obter(req.usuario.id);
  res.status(200).json(usuario);
});

const alterarSenha = asyncHandler(async (req, res) => {
  const resultado = await userService.alterarSenha(req.usuario.id, req.body);
  res.status(200).json(resultado);
});

const atualizarPerfil = asyncHandler(async (req, res) => {
  const usuario = await userService.atualizarPerfil(req.usuario.id, req.body);
  res.status(200).json(usuario);
});

module.exports = { obterMe, alterarSenha, atualizarPerfil };
