// Regras de negócio dos produtos.
const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const storageService = require("./storage.service");

// Lista produtos com suas imagens. Se apenasDestaque=true, filtra destaque.
async function listar({ apenasDestaque = false } = {}) {
  const where = apenasDestaque ? { destaque: true } : {};

  return prisma.produto.findMany({
    where,
    include: { imagens: true },
    orderBy: { id: "desc" },
  });
}

// Busca por nome OU descrição (case-insensitive).
async function buscar(termo) {
  const q = (termo || "").trim();
  if (!q) return [];

  return prisma.produto.findMany({
    where: {
      OR: [
        { nome: { contains: q, mode: "insensitive" } },
        { descricao: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { imagens: true },
    orderBy: { id: "desc" },
  });
}

// Até 4 produtos recentes para a seção "outros produtos" do checkout.
async function sugestoes() {
  return prisma.produto.findMany({
    take: 4,
    include: { imagens: true },
    orderBy: { id: "desc" },
  });
}

// Um produto com todas as imagens (galeria). 404 se não existir.
async function obterPorId(id) {
  const produto = await prisma.produto.findUnique({
    where: { id },
    include: { imagens: true },
  });

  if (!produto) {
    throw new AppError("Produto não encontrado", 404);
  }

  return produto;
}

// Cria o produto e suas imagens de forma atômica (a escrita aninhada do
// Prisma roda numa transação implícita). A primeira URL vira a principal.
async function criar({ dados, urls, fkIdCriador }) {
  return prisma.produto.create({
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      precoAtual: dados.precoAtual,
      estoqueAtual: dados.estoqueAtual,
      destaque: dados.destaque,
      fkIdCriador,
      imagens: {
        create: urls.map((url, index) => ({
          url,
          principal: index === 0,
        })),
      },
    },
    include: { imagens: true },
  });
}

// Atualização parcial. Só atualiza os campos enviados (undefined é ignorado
// pelo Prisma). Se vierem novas imagens, são ADICIONADAS (não substituem as
// antigas) com principal: false. O upload só acontece após confirmar que o
// produto existe, para não deixar arquivos órfãos no Storage em caso de 404.
async function atualizar(id, dados, files = []) {
  const existe = await prisma.produto.findUnique({ where: { id } });
  if (!existe) {
    throw new AppError("Produto não encontrado", 404);
  }

  let novasUrls = [];
  if (files.length > 0) {
    novasUrls = await storageService.uploadImagens(files);
  }

  return prisma.produto.update({
    where: { id },
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      precoAtual: dados.precoAtual,
      estoqueAtual: dados.estoqueAtual,
      destaque: dados.destaque,
      ...(novasUrls.length > 0
        ? { imagens: { create: novasUrls.map((url) => ({ url, principal: false })) } }
        : {}),
    },
    include: { imagens: true },
  });
}

// Exclusão com proteção de integridade: se o produto já está em algum pedido
// (item_pedido), NÃO excluímos — bloqueamos com 409 para preservar o histórico.
// Caso contrário, excluímos (imagens caem em cascata) e limpamos o Storage.
async function excluir(id) {
  const produto = await prisma.produto.findUnique({
    where: { id },
    include: { imagens: true },
  });

  if (!produto) {
    throw new AppError("Produto não encontrado", 404);
  }

  const itensVinculados = await prisma.itemPedido.count({
    where: { fkIdProduto: id },
  });

  if (itensVinculados > 0) {
    throw new AppError(
      "Não é possível excluir: este produto está vinculado a pedidos existentes " +
        "e removê-lo quebraria o histórico de pedidos. (Sugestão futura: implementar " +
        "soft-delete com um campo 'ativo'.)",
      409
    );
  }

  // Remove os registros (produto_imagem cai em cascata) e os arquivos do Storage.
  await prisma.produto.delete({ where: { id } });
  await storageService
    .removerImagensPorUrl(produto.imagens.map((img) => img.url))
    .catch(() => {});

  return { message: "Produto excluído com sucesso" };
}

module.exports = { listar, buscar, sugestoes, obterPorId, criar, atualizar, excluir };
