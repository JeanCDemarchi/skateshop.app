// Controllers de pedidos / checkout.
const pedidoService = require("../services/pedido.service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const criar = asyncHandler(async (req, res) => {
  const pedido = await pedidoService.criar(req.usuario.id, req.body);
  res.status(201).json(pedido);
});

const listar = asyncHandler(async (req, res) => {
  const pedidos = await pedidoService.listarDoUsuario(req.usuario.id);
  res.status(200).json(pedidos);
});

const obterPorId = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("id de pedido inválido", 400);
  }
  const pedido = await pedidoService.obterDoUsuario(req.usuario.id, id);
  res.status(200).json(pedido);
});

module.exports = { criar, listar, obterPorId };
