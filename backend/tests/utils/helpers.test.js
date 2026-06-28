const AppError = require("../../src/utils/AppError");
const asyncHandler = require("../../src/utils/asyncHandler");

describe("AppError", () => {
  test("cria erro de aplicação com status padrão", () => {
    const error = new AppError("Dados inválidos");
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.message).toBe("Dados inválidos");
    expect(error.status).toBe(400);
  });

  test("aceita um status HTTP customizado", () => {
    expect(new AppError("Não encontrado", 404).status).toBe(404);
  });
});

describe("asyncHandler", () => {
  test("executa o handler com os argumentos originais", async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const handler = jest.fn().mockResolvedValue("ok");

    await asyncHandler(handler)(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  test("encaminha rejeições para next", async () => {
    const error = new Error("falhou");
    const next = jest.fn();

    await asyncHandler(async () => {
      throw error;
    })({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test("propaga exceções síncronas do handler", () => {
    const error = new Error("falhou cedo");
    const next = jest.fn();

    expect(() =>
      asyncHandler(() => {
        throw error;
      })({}, {}, next)
    ).toThrow(error);
    expect(next).not.toHaveBeenCalled();
  });
});
