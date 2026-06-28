jest.mock("../../src/services/auth.service", () => ({
  register: jest.fn(),
  login: jest.fn(),
}));

const authService = require("../../src/services/auth.service");
const controller = require("../../src/controllers/auth.controller");
const { executar } = require("./helpers");

describe("auth.controller", () => {
  test("register repassa o body e responde 201", async () => {
    const body = { username: "ana", senha: "segredo" };
    const usuario = { id: 1, username: "ana" };
    authService.register.mockResolvedValue(usuario);
    const { res, next } = await executar(controller.register, { body });
    expect(authService.register).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(usuario);
    expect(next).not.toHaveBeenCalled();
  });

  test("register encaminha erro do service", async () => {
    const error = new Error("conflito");
    authService.register.mockRejectedValue(error);
    const { res, next } = await executar(controller.register, { body: {} });
    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("login repassa o body e responde 200", async () => {
    const body = { username: "ana", senha: "segredo" };
    const resultado = { token: "jwt", usuario: { id: 1 } };
    authService.login.mockResolvedValue(resultado);
    const { res, next } = await executar(controller.login, { body });
    expect(authService.login).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resultado);
    expect(next).not.toHaveBeenCalled();
  });

  test("login encaminha erro do service", async () => {
    const error = new Error("credenciais");
    authService.login.mockRejectedValue(error);
    const { next } = await executar(controller.login, { body: {} });
    expect(next).toHaveBeenCalledWith(error);
  });
});
