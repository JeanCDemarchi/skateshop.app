jest.mock("../../src/services/user.service", () => ({
  obter: jest.fn(),
  alterarSenha: jest.fn(),
  atualizarPerfil: jest.fn(),
}));

const userService = require("../../src/services/user.service");
const controller = require("../../src/controllers/user.controller");
const { executar } = require("./helpers");

describe("user.controller", () => {
  test("obterMe usa req.usuario e responde 200", async () => {
    const usuario = { id: 7, nome: "Ana" };
    userService.obter.mockResolvedValue(usuario);
    const { res } = await executar(controller.obterMe, {
      usuario: { id: 7 },
    });
    expect(userService.obter).toHaveBeenCalledWith(7);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(usuario);
  });

  test("obterMe encaminha erro do service", async () => {
    const error = new Error("ausente");
    userService.obter.mockRejectedValue(error);
    const { next } = await executar(controller.obterMe, {
      usuario: { id: 7 },
    });
    expect(next).toHaveBeenCalledWith(error);
  });

  test("alterarSenha repassa usuário e body e responde 200", async () => {
    const body = { senhaAtual: "a", novaSenha: "b" };
    const resultado = { message: "Senha alterada com sucesso" };
    userService.alterarSenha.mockResolvedValue(resultado);
    const { res } = await executar(controller.alterarSenha, {
      usuario: { id: 7 },
      body,
    });
    expect(userService.alterarSenha).toHaveBeenCalledWith(7, body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resultado);
  });

  test("alterarSenha encaminha erro do service", async () => {
    const error = new Error("senha incorreta");
    userService.alterarSenha.mockRejectedValue(error);
    const { next } = await executar(controller.alterarSenha, {
      usuario: { id: 7 },
      body: {},
    });
    expect(next).toHaveBeenCalledWith(error);
  });

  test("atualizarPerfil repassa usuário e body e responde 200", async () => {
    const body = { nome: "Nova" };
    const usuario = { id: 7, nome: "Nova" };
    userService.atualizarPerfil.mockResolvedValue(usuario);
    const { res } = await executar(controller.atualizarPerfil, {
      usuario: { id: 7 },
      body,
    });
    expect(userService.atualizarPerfil).toHaveBeenCalledWith(7, body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(usuario);
  });

  test("atualizarPerfil encaminha erro do service", async () => {
    const error = new Error("conflito");
    userService.atualizarPerfil.mockRejectedValue(error);
    const { next } = await executar(controller.atualizarPerfil, {
      usuario: { id: 7 },
      body: {},
    });
    expect(next).toHaveBeenCalledWith(error);
  });
});
