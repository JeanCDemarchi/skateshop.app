const prisma = require("../../src/config/prisma");
const service = require("../../src/services/pedido.service");

const criarTx = (produtos = []) => ({
  produto: {
    findMany: jest.fn().mockResolvedValue(produtos),
    update: jest.fn().mockResolvedValue({}),
  },
  pedido: {
    create: jest.fn().mockResolvedValue({ id: 50 }),
  },
});

describe("pedido.service", () => {
  test("cria pedido com preço do banco, soma repetidos e decrementa estoque", async () => {
    const tx = criarTx([
      { id: 1, nome: "Shape", precoAtual: 10.555, estoqueAtual: 5 },
      { id: 2, nome: "Truck", precoAtual: 20, estoqueAtual: 2 },
    ]);
    prisma.$transaction.mockImplementation((callback) => callback(tx));
    jest.spyOn(Date, "now").mockReturnValue(1000);
    jest.spyOn(Math, "random").mockReturnValue(0.123456);

    const result = await service.criar(7, {
      itens: [
        { fkIdProduto: 1, quantidade: 1 },
        { fkIdProduto: 1, quantidade: 2 },
        { fkIdProduto: 2, quantidade: 1 },
      ],
      metodoPagamento: "Pix",
    });

    expect(result).toEqual({ id: 50 });
    expect(tx.produto.findMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] } },
    });
    const create = tx.pedido.create.mock.calls[0][0];
    expect(create.data.valorTotal).toBe(51.67);
    expect(create.data.fkIdUsuario).toBe(7);
    expect(create.data.itens.create).toEqual([
      { fkIdProduto: 1, quantidade: 1, precoUnitarioVenda: 10.555 },
      { fkIdProduto: 1, quantidade: 2, precoUnitarioVenda: 10.555 },
      { fkIdProduto: 2, quantidade: 1, precoUnitarioVenda: 20 },
    ]);
    expect(create.data.pagamento.create).toMatchObject({
      metodoPagamento: "Pix",
      statusTransacao: "Aprovado",
      idTransacaoGateway: "SIMULADO-1000-123456",
    });
    expect(create.data.pagamento.create.dataPagamento).toBeInstanceOf(Date);
    expect(create.data.envio.create).toEqual({ statusEntrega: "Em preparação" });
    expect(tx.produto.update).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      data: { estoqueAtual: { decrement: 3 } },
    });
    expect(tx.produto.update).toHaveBeenNthCalledWith(2, {
      where: { id: 2 },
      data: { estoqueAtual: { decrement: 1 } },
    });
  });

  test("rejeita produto não encontrado dentro da transação", async () => {
    const tx = criarTx([]);
    prisma.$transaction.mockImplementation((callback) => callback(tx));
    await expect(
      service.criar(7, {
        itens: [{ fkIdProduto: 99, quantidade: 1 }],
        metodoPagamento: "Pix",
      })
    ).rejects.toMatchObject({
      message: "Produto 99 não encontrado",
      status: 404,
    });
    expect(tx.pedido.create).not.toHaveBeenCalled();
  });

  test("rejeita estoque insuficiente considerando itens repetidos", async () => {
    const tx = criarTx([{ id: 1, nome: "Shape", precoAtual: 10, estoqueAtual: 2 }]);
    prisma.$transaction.mockImplementation((callback) => callback(tx));
    await expect(
      service.criar(7, {
        itens: [
          { fkIdProduto: 1, quantidade: 1 },
          { fkIdProduto: 1, quantidade: 2 },
        ],
        metodoPagamento: "Pix",
      })
    ).rejects.toMatchObject({
      message: expect.stringContaining("Estoque insuficiente"),
      status: 400,
    });
  });

  test("propaga erro externo da transação", async () => {
    const error = new Error("transação indisponível");
    prisma.$transaction.mockRejectedValue(error);
    await expect(
      service.criar(1, { itens: [], metodoPagamento: "Pix" })
    ).rejects.toBe(error);
  });

  test("listarDoUsuario restringe e ordena pedidos do usuário", async () => {
    prisma.pedido.findMany.mockResolvedValue([{ id: 2 }]);
    await expect(service.listarDoUsuario(7)).resolves.toEqual([{ id: 2 }]);
    expect(prisma.pedido.findMany).toHaveBeenCalledWith({
      where: { fkIdUsuario: 7 },
      include: {
        itens: { include: { produto: true } },
        pagamento: true,
        envio: true,
      },
      orderBy: { id: "desc" },
    });
  });

  test("obterDoUsuario restringe por pedido e proprietário", async () => {
    const pedido = { id: 5 };
    prisma.pedido.findFirst.mockResolvedValue(pedido);
    await expect(service.obterDoUsuario(7, 5)).resolves.toBe(pedido);
    expect(prisma.pedido.findFirst.mock.calls[0][0].where).toEqual({
      id: 5,
      fkIdUsuario: 7,
    });
  });

  test("obterDoUsuario oculta pedido inexistente ou de outro usuário", async () => {
    prisma.pedido.findFirst.mockResolvedValue(null);
    await expect(service.obterDoUsuario(7, 5)).rejects.toMatchObject({
      message: "Pedido não encontrado",
      status: 404,
    });
  });
});
