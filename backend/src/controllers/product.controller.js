// Controllers de produtos.
const productService = require("../services/product.service");
const storageService = require("../services/storage.service");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const listar = asyncHandler(async (req, res) => {
  const apenasDestaque = req.query.destaque === "true";
  const produtos = await productService.listar({ apenasDestaque });
  res.status(200).json(produtos);
});

const buscar = asyncHandler(async (req, res) => {
  const produtos = await productService.buscar(req.query.q);
  res.status(200).json(produtos);
});

const sugestoes = asyncHandler(async (req, res) => {
  const produtos = await productService.sugestoes();
  res.status(200).json(produtos);
});

const obterPorId = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("id de produto inválido", 400);
  }
  const produto = await productService.obterPorId(id);
  res.status(200).json(produto);
});

const criar = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) {
    throw new AppError("Envie pelo menos uma imagem do produto (campo 'imagens')", 400);
  }

  // 1) Sobe as imagens primeiro. Se o Storage falhar, nada é gravado no banco
  //    (não cria produto órfão).
  const urls = await storageService.uploadImagens(files);

  // 2) Cria produto + imagens de forma atômica.
  const produto = await productService.criar({
    dados: req.body, // já validado e normalizado pelo Zod
    urls,
    fkIdCriador: req.usuario.id,
  });

  res.status(201).json(produto);
});

const editar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("id de produto inválido", 400);
  }

  // req.body já validado pelo Zod (campos opcionais); req.files = novas imagens.
  const produto = await productService.atualizar(id, req.body, req.files || []);
  res.status(200).json(produto);
});

const excluir = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("id de produto inválido", 400);
  }

  const resultado = await productService.excluir(id);
  res.status(200).json(resultado);
});

module.exports = { listar, buscar, sugestoes, obterPorId, criar, editar, excluir };
