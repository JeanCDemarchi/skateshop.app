jest.mock("../../src/services/pedido.service", () => ({
  criar: jest.fn(),
  listarDoUsuario: jest.fn(),
  obterDoUsuario: jest.fn(),
}));

const pedidoService = require("../../src/services/pedido.service");
const controller = require("../../src/controllers/pedido.controller");
const { executar } = require("./helpers");

describe("pedido.controller", () => {
  test("criar usa req.usuario, repassa body e responde 201", async () => {
    const body = { itens: [{ fkIdProduto: 1 }], metodoPagamento: "Pix" };
    const pedido = { id: 10 };
    pedidoService.criar.mockResolvedValue(pedido);
    const { res, next } = await executar(controller.criar, {
      usuario: { id: 7 },
      body,
    });
    expect(pedidoService.criar).toHaveBeenCalledWith(7, body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(pedido);
    expect(next).not.toHaveBeenCalled();
  });

  test("criar encaminha erro do service", async () => {
    const error = new Error("estoque");
    pedidoService.criar.mockRejectedValue(error);
    const { next } = await executar(controller.criar, {
      usuario: { id: 7 },
      body: {},
    });
    expect(next).toHaveBeenCalledWith(error);
  });

  test("listar restringe pelo usuário e responde 200", async () => {
    const pedidos = [{ id: 2 }, { id: 1 }];
    pedidoService.listarDoUsuario.mockResolvedValue(pedidos);
    const { res } = await executar(controller.listar, {
      usuario: { id: 7 },
      query: { page: "3", limit: "10" },
    });
    expect(pedidoService.listarDoUsuario).toHaveBeenCalledWith(7);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(pedidos);
  });

  test("listar encaminha erro do service", async () => {
    const error = new Error("falha");
    pedidoService.listarDoUsuario.mockRejectedValue(error);
    const { next } = await executar(controller.listar, { usuario: { id: 7 } });
    expect(next).toHaveBeenCalledWith(error);
  });

  test.each([
    ["12", 12],
    ["001", 1],
  ])("obterPorId converte id %p e responde 200", async (param, id) => {
    const pedido = { id };
    pedidoService.obterDoUsuario.mockResolvedValue(pedido);
    const { res } = await executar(controller.obterPorId, {
      usuario: { id: 7 },
      params: { id: param },
    });
    expect(pedidoService.obterDoUsuario).toHaveBeenCalledWith(7, id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(pedido);
  });

  test.each(["0", "-1", "1.5", "abc", "", "Infinity"])(
    "obterPorId rejeita id inválido %p sem chamar service",
    async (id) => {
      const { res, next } = await executar(controller.obterPorId, {
        usuario: { id: 7 },
        params: { id },
      });
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "id de pedido inválido", status: 400 })
      );
      expect(pedidoService.obterDoUsuario).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    }
  );

  test("obterPorId encaminha erro do service", async () => {
    const error = new Error("não encontrado");
    pedidoService.obterDoUsuario.mockRejectedValue(error);
    const { next } = await executar(controller.obterPorId, {
      usuario: { id: 7 },
      params: { id: "3" },
    });
    expect(next).toHaveBeenCalledWith(error);
  });
});
