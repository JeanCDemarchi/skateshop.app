// Regras de negócio dos pedidos / checkout.
const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

// Inclusões padrão para devolver o pedido completo nas respostas.
const PEDIDO_INCLUDE = {
  itens: { include: { produto: true } },
  pagamento: true,
  envio: true,
};

// Finaliza a compra. Tudo roda numa transação: ou salva tudo, ou nada.
async function criar(usuarioId, { itens, metodoPagamento }) {
  return prisma.$transaction(async (tx) => {
    // Soma as quantidades por produto (caso o mesmo produto venha repetido),
    // para validar o estoque corretamente.
    const totalPorProduto = new Map();
    for (const item of itens) {
      totalPorProduto.set(
        item.fkIdProduto,
        (totalPorProduto.get(item.fkIdProduto) || 0) + item.quantidade
      );
    }

    // Busca os produtos envolvidos.
    const ids = [...totalPorProduto.keys()];
    const produtos = await tx.produto.findMany({ where: { id: { in: ids } } });
    const mapaProdutos = new Map(produtos.map((p) => [p.id, p]));

    // (a) existência e (b) estoque.
    for (const [idProduto, quantidadeTotal] of totalPorProduto) {
      const produto = mapaProdutos.get(idProduto);
      if (!produto) {
        throw new AppError(`Produto ${idProduto} não encontrado`, 404);
      }
      if (quantidadeTotal > produto.estoqueAtual) {
        throw new AppError(
          `Estoque insuficiente para "${produto.nome}" (id ${produto.id}): ` +
            `solicitado ${quantidadeTotal}, disponível ${produto.estoqueAtual}`,
          400
        );
      }
    }

    // (c) preço do banco (nunca do frontend) e cálculo do total.
    let valorTotal = 0;
    const itensPedido = itens.map((item) => {
      const produto = mapaProdutos.get(item.fkIdProduto);
      const precoUnitarioVenda = produto.precoAtual;
      valorTotal += precoUnitarioVenda * item.quantidade;
      return {
        fkIdProduto: item.fkIdProduto,
        quantidade: item.quantidade,
        precoUnitarioVenda,
      };
    });
    valorTotal = Math.round(valorTotal * 100) / 100; // 2 casas decimais

    // (d-g) cria pedido + itens + pagamento + envio de uma vez.
    const pedido = await tx.pedido.create({
      data: {
        status: "Pendente",
        valorTotal,
        fkIdUsuario: usuarioId,
        itens: { create: itensPedido },
        pagamento: {
          create: {
            metodoPagamento,
            statusTransacao: "Aprovado",
            dataPagamento: new Date(),
            idTransacaoGateway: `SIMULADO-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
          },
        },
        envio: {
          create: {
            statusEntrega: "Em preparação",
          },
        },
      },
      include: PEDIDO_INCLUDE,
    });

    // (h) decrementa o estoque de cada produto.
    for (const [idProduto, quantidadeTotal] of totalPorProduto) {
      await tx.produto.update({
        where: { id: idProduto },
        data: { estoqueAtual: { decrement: quantidadeTotal } },
      });
    }

    return pedido;
  });
}

// Lista os pedidos do usuário logado.
async function listarDoUsuario(usuarioId) {
  return prisma.pedido.findMany({
    where: { fkIdUsuario: usuarioId },
    include: PEDIDO_INCLUDE,
    orderBy: { id: "desc" },
  });
}

// Detalhe de um pedido — só retorna se pertencer ao usuário logado.
async function obterDoUsuario(usuarioId, id) {
  const pedido = await prisma.pedido.findFirst({
    where: { id, fkIdUsuario: usuarioId },
    include: PEDIDO_INCLUDE,
  });

  if (!pedido) {
    // Mesma resposta para "não existe" e "é de outro usuário".
    throw new AppError("Pedido não encontrado", 404);
  }

  return pedido;
}

module.exports = { criar, listarDoUsuario, obterDoUsuario };
