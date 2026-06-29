jest.mock("../../src/services/product.service", () => ({
  listar: jest.fn(),
  buscar: jest.fn(),
  sugestoes: jest.fn(),
  obterPorId: jest.fn(),
  criar: jest.fn(),
  atualizar: jest.fn(),
  excluir: jest.fn(),
}));
jest.mock("../../src/services/storage.service", () => ({
  uploadImagens: jest.fn(),
}));

const productService = require("../../src/services/product.service");
const storageService = require("../../src/services/storage.service");
const controller = require("../../src/controllers/product.controller");
const { executar } = require("./helpers");

describe("product.controller", () => {
  test.each([
    ["true", true],
    ["false", false],
    ["TRUE", false],
    [undefined, false],
  ])("listar interpreta destaque %p como %p", async (destaque, apenasDestaque) => {
    const produtos = [{ id: 1 }];
    productService.listar.mockResolvedValue(produtos);
    const { res } = await executar(controller.listar, { query: { destaque } });
    expect(productService.listar).toHaveBeenCalledWith({ apenasDestaque });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(produtos);
  });

  test("listar ignora parâmetros de paginação não suportados", async () => {
    productService.listar.mockResolvedValue([]);
    await executar(controller.listar, {
      query: { page: "2", limit: "20" },
    });
    expect(productService.listar).toHaveBeenCalledWith({ apenasDestaque: false });
  });

  test("listar encaminha erro do service", async () => {
    const error = new Error("falha");
    productService.listar.mockRejectedValue(error);
    const { next } = await executar(controller.listar, { query: {} });
    expect(next).toHaveBeenCalledWith(error);
  });

  test("buscar repassa o filtro q e responde 200", async () => {
    productService.buscar.mockResolvedValue([{ id: 2 }]);
    const { res } = await executar(controller.buscar, { query: { q: "shape" } });
    expect(productService.buscar).toHaveBeenCalledWith("shape");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 2 }]);
  });

  test("buscar encaminha erro do service", async () => {
    const error = new Error("busca falhou");
    productService.buscar.mockRejectedValue(error);
    const { next } = await executar(controller.buscar, { query: {} });
    expect(next).toHaveBeenCalledWith(error);
  });

  test("sugestoes responde 200", async () => {
    productService.sugestoes.mockResolvedValue([{ id: 3 }]);
    const { res } = await executar(controller.sugestoes, {});
    expect(productService.sugestoes).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 3 }]);
  });

  test("sugestoes encaminha erro do service", async () => {
    const error = new Error("falha");
    productService.sugestoes.mockRejectedValue(error);
    const { next } = await executar(controller.sugestoes, {});
    expect(next).toHaveBeenCalledWith(error);
  });

  test("obterPorId converte id e responde 200", async () => {
    productService.obterPorId.mockResolvedValue({ id: 4 });
    const { res } = await executar(controller.obterPorId, {
      params: { id: "4" },
    });
    expect(productService.obterPorId).toHaveBeenCalledWith(4);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 4 });
  });

  test.each(["0", "-2", "2.5", "x", "", "Infinity"])(
    "obterPorId rejeita id inválido %p",
    async (id) => {
      const { next } = await executar(controller.obterPorId, { params: { id } });
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "id de produto inválido", status: 400 })
      );
      expect(productService.obterPorId).not.toHaveBeenCalled();
    }
  );

  test("obterPorId encaminha erro do service", async () => {
    const error = new Error("ausente");
    productService.obterPorId.mockRejectedValue(error);
    const { next } = await executar(controller.obterPorId, {
      params: { id: "4" },
    });
    expect(next).toHaveBeenCalledWith(error);
  });

  test.each([undefined, []])("criar exige ao menos uma imagem (%p)", async (files) => {
    const { next } = await executar(controller.criar, {
      files,
      body: {},
      usuario: { id: 7 },
    });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Envie pelo menos uma imagem do produto (campo 'imagens')",
        status: 400,
      })
    );
    expect(storageService.uploadImagens).not.toHaveBeenCalled();
    expect(productService.criar).not.toHaveBeenCalled();
  });

  test("criar envia imagens, repassa autor e responde 201", async () => {
    const files = [{ originalname: "shape.png" }];
    const body = { nome: "Shape" };
    storageService.uploadImagens.mockResolvedValue(["url"]);
    productService.criar.mockResolvedValue({ id: 5 });
    const { res, next } = await executar(controller.criar, {
      files,
      body,
      usuario: { id: 7 },
    });
    expect(storageService.uploadImagens).toHaveBeenCalledWith(files);
    expect(productService.criar).toHaveBeenCalledWith({
      dados: body,
      urls: ["url"],
      fkIdCriador: 7,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 5 });
    expect(next).not.toHaveBeenCalled();
  });

  test("criar encaminha falha de upload sem chamar product service", async () => {
    const error = new Error("storage");
    storageService.uploadImagens.mockRejectedValue(error);
    const { next } = await executar(controller.criar, {
      files: [{}],
      body: {},
      usuario: { id: 7 },
    });
    expect(next).toHaveBeenCalledWith(error);
    expect(productService.criar).not.toHaveBeenCalled();
  });

  test("criar encaminha falha do product service", async () => {
    const error = new Error("banco");
    storageService.uploadImagens.mockResolvedValue(["url"]);
    productService.criar.mockRejectedValue(error);
    const { next } = await executar(controller.criar, {
      files: [{}],
      body: {},
      usuario: { id: 7 },
    });
    expect(next).toHaveBeenCalledWith(error);
  });

  test("editar converte id, usa array vazio padrão e responde 200", async () => {
    productService.atualizar.mockResolvedValue({ id: 6 });
    const body = { nome: "Novo" };
    const { res } = await executar(controller.editar, {
      params: { id: "6" },
      body,
    });
    expect(productService.atualizar).toHaveBeenCalledWith(6, body, []);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 6 });
  });

  test("editar repassa os novos arquivos", async () => {
    const files = [{}];
    productService.atualizar.mockResolvedValue({ id: 6 });
    await executar(controller.editar, {
      params: { id: "6" },
      body: {},
      files,
    });
    expect(productService.atualizar).toHaveBeenCalledWith(6, {}, files);
  });

  test.each(["0", "-1", "1.2", "abc", ""])("editar rejeita id inválido %p", async (id) => {
    const { next } = await executar(controller.editar, {
      params: { id },
      body: {},
    });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
    expect(productService.atualizar).not.toHaveBeenCalled();
  });

  test("editar encaminha erro do service", async () => {
    const error = new Error("falha");
    productService.atualizar.mockRejectedValue(error);
    const { next } = await executar(controller.editar, {
      params: { id: "1" },
      body: {},
    });
    expect(next).toHaveBeenCalledWith(error);
  });

  test("excluir converte id e responde 200", async () => {
    const resultado = { message: "Produto excluído com sucesso" };
    productService.excluir.mockResolvedValue(resultado);
    const { res } = await executar(controller.excluir, { params: { id: "8" } });
    expect(productService.excluir).toHaveBeenCalledWith(8);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resultado);
  });

  test.each(["0", "-1", "1.2", "abc", ""])("excluir rejeita id inválido %p", async (id) => {
    const { next } = await executar(controller.excluir, { params: { id } });
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
    expect(productService.excluir).not.toHaveBeenCalled();
  });

  test("excluir encaminha erro do service", async () => {
    const error = new Error("conflito");
    productService.excluir.mockRejectedValue(error);
    const { next } = await executar(controller.excluir, {
      params: { id: "8" },
    });
    expect(next).toHaveBeenCalledWith(error);
  });
});
