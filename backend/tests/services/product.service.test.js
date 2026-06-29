jest.mock("../../src/services/storage.service", () => ({
  uploadImagens: jest.fn(),
  removerImagensPorUrl: jest.fn(),
}));

const prisma = require("../../src/config/prisma");
const storage = require("../../src/services/storage.service");
const service = require("../../src/services/product.service");

describe("product.service", () => {
  test.each([
    [undefined, {}],
    [{}, {}],
    [{ apenasDestaque: false }, {}],
    [{ apenasDestaque: true }, { destaque: true }],
  ])("listar aplica o filtro esperado", async (opcoes, where) => {
    prisma.produto.findMany.mockResolvedValue(["produto"]);
    await expect(service.listar(opcoes)).resolves.toEqual(["produto"]);
    expect(prisma.produto.findMany).toHaveBeenCalledWith({
      where,
      include: { imagens: true },
      orderBy: { id: "desc" },
    });
  });

  test.each([undefined, null, "", "   "])("buscar retorna vazio para termo %p", async (termo) => {
    await expect(service.buscar(termo)).resolves.toEqual([]);
    expect(prisma.produto.findMany).not.toHaveBeenCalled();
  });

  test("buscar normaliza o termo e consulta nome ou descrição", async () => {
    prisma.produto.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(service.buscar("  shape  ")).resolves.toEqual([{ id: 1 }]);
    expect(prisma.produto.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { nome: { contains: "shape", mode: "insensitive" } },
          { descricao: { contains: "shape", mode: "insensitive" } },
        ],
      },
      include: { imagens: true },
      orderBy: { id: "desc" },
    });
  });

  test("sugestoes limita aos quatro produtos mais recentes", async () => {
    prisma.produto.findMany.mockResolvedValue([]);
    await service.sugestoes();
    expect(prisma.produto.findMany).toHaveBeenCalledWith({
      take: 4,
      include: { imagens: true },
      orderBy: { id: "desc" },
    });
  });

  test("obterPorId devolve produto com imagens", async () => {
    const produto = { id: 3, imagens: [] };
    prisma.produto.findUnique.mockResolvedValue(produto);
    await expect(service.obterPorId(3)).resolves.toBe(produto);
    expect(prisma.produto.findUnique).toHaveBeenCalledWith({
      where: { id: 3 },
      include: { imagens: true },
    });
  });

  test("obterPorId rejeita produto ausente", async () => {
    prisma.produto.findUnique.mockResolvedValue(null);
    await expect(service.obterPorId(99)).rejects.toMatchObject({
      message: "Produto não encontrado",
      status: 404,
    });
  });

  test("criar define a primeira imagem como principal", async () => {
    const produto = { id: 1 };
    prisma.produto.create.mockResolvedValue(produto);
    const dados = {
      nome: "Shape",
      descricao: "Maple",
      precoAtual: 200,
      estoqueAtual: 5,
      destaque: true,
    };
    await expect(
      service.criar({ dados, urls: ["url-1", "url-2"], fkIdCriador: 7 })
    ).resolves.toBe(produto);
    expect(prisma.produto.create).toHaveBeenCalledWith({
      data: {
        ...dados,
        fkIdCriador: 7,
        imagens: {
          create: [
            { url: "url-1", principal: true },
            { url: "url-2", principal: false },
          ],
        },
      },
      include: { imagens: true },
    });
  });

  test("atualizar verifica existência antes de qualquer upload", async () => {
    prisma.produto.findUnique.mockResolvedValue(null);
    await expect(service.atualizar(9, {}, [{ buffer: "x" }])).rejects.toMatchObject({
      status: 404,
    });
    expect(storage.uploadImagens).not.toHaveBeenCalled();
    expect(prisma.produto.update).not.toHaveBeenCalled();
  });

  test("atualizar sem arquivos não inclui escrita aninhada", async () => {
    prisma.produto.findUnique.mockResolvedValue({ id: 1 });
    prisma.produto.update.mockResolvedValue({ id: 1 });
    await service.atualizar(1, { nome: "Novo" });
    expect(storage.uploadImagens).not.toHaveBeenCalled();
    expect(prisma.produto.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        nome: "Novo",
        descricao: undefined,
        precoAtual: undefined,
        estoqueAtual: undefined,
        destaque: undefined,
      },
      include: { imagens: true },
    });
  });

  test("atualizar adiciona novas imagens não principais", async () => {
    const files = [{ originalname: "a.png" }];
    prisma.produto.findUnique.mockResolvedValue({ id: 1 });
    storage.uploadImagens.mockResolvedValue(["url-a", "url-b"]);
    prisma.produto.update.mockResolvedValue({ id: 1 });
    await service.atualizar(1, { destaque: true }, files);
    expect(storage.uploadImagens).toHaveBeenCalledWith(files);
    expect(prisma.produto.update.mock.calls[0][0].data.imagens).toEqual({
      create: [
        { url: "url-a", principal: false },
        { url: "url-b", principal: false },
      ],
    });
  });

  test("atualizar propaga falha externa de upload sem atualizar banco", async () => {
    const error = new Error("storage fora");
    prisma.produto.findUnique.mockResolvedValue({ id: 1 });
    storage.uploadImagens.mockRejectedValue(error);
    await expect(service.atualizar(1, {}, [{}])).rejects.toBe(error);
    expect(prisma.produto.update).not.toHaveBeenCalled();
  });

  test("excluir rejeita produto ausente", async () => {
    prisma.produto.findUnique.mockResolvedValue(null);
    await expect(service.excluir(1)).rejects.toMatchObject({ status: 404 });
    expect(prisma.itemPedido.count).not.toHaveBeenCalled();
  });

  test("excluir protege produto vinculado a pedido", async () => {
    prisma.produto.findUnique.mockResolvedValue({ id: 1, imagens: [] });
    prisma.itemPedido.count.mockResolvedValue(2);
    await expect(service.excluir(1)).rejects.toMatchObject({
      status: 409,
      message: expect.stringContaining("vinculado a pedidos"),
    });
    expect(prisma.produto.delete).not.toHaveBeenCalled();
  });

  test("excluir remove banco e imagens do storage", async () => {
    prisma.produto.findUnique.mockResolvedValue({
      id: 1,
      imagens: [{ url: "url-a" }, { url: "url-b" }],
    });
    prisma.itemPedido.count.mockResolvedValue(0);
    prisma.produto.delete.mockResolvedValue({});
    storage.removerImagensPorUrl.mockResolvedValue();
    await expect(service.excluir(1)).resolves.toEqual({
      message: "Produto excluído com sucesso",
    });
    expect(prisma.produto.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(storage.removerImagensPorUrl).toHaveBeenCalledWith(["url-a", "url-b"]);
  });

  test("excluir ignora falha de limpeza do storage após remover do banco", async () => {
    prisma.produto.findUnique.mockResolvedValue({ id: 1, imagens: [] });
    prisma.itemPedido.count.mockResolvedValue(0);
    storage.removerImagensPorUrl.mockRejectedValue(new Error("storage fora"));
    await expect(service.excluir(1)).resolves.toEqual({
      message: "Produto excluído com sucesso",
    });
  });
});
