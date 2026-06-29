jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const multer = require("multer");
const admin = require("../../src/middlewares/admin");
const auth = require("../../src/middlewares/auth");
const { notFound, errorHandler } = require("../../src/middlewares/errorHandler");
const upload = require("../../src/middlewares/upload");
const validate = require("../../src/middlewares/validate");
const { z } = require("zod");

const criarResposta = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe("admin", () => {
  test.each([undefined, { role: "cliente" }])("nega usuário não administrador", (usuario) => {
    const res = criarResposta();
    const next = jest.fn();
    admin({ usuario }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Acesso restrito a administradores",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("libera administrador", () => {
    const next = jest.fn();
    admin({ usuario: { role: "admin" } }, criarResposta(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("auth", () => {
  const segredoAnterior = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = "segredo-de-teste";
  });

  afterAll(() => {
    process.env.JWT_SECRET = segredoAnterior;
  });

  test.each([undefined, "", "Token abc", "Bearer", "Bearer "])(
    "rejeita cabeçalho inválido %p",
    (authorization) => {
      const res = criarResposta();
      const next = jest.fn();
      auth({ headers: { authorization } }, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token não fornecido" });
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    }
  );

  test("valida token, expõe usuário e chama next", () => {
    jwt.verify.mockReturnValue({
      id: 7,
      username: "ana",
      role: "admin",
      dadoExtra: "ignorado",
    });
    const req = { headers: { authorization: "Bearer token-valido" } };
    const next = jest.fn();

    auth(req, criarResposta(), next);

    expect(jwt.verify).toHaveBeenCalledWith("token-valido", "segredo-de-teste");
    expect(req.usuario).toEqual({ id: 7, username: "ana", role: "admin" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("rejeita token inválido ou expirado", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("jwt expired");
    });
    const res = criarResposta();
    const next = jest.fn();

    auth({ headers: { authorization: "Bearer expirado" } }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Token inválido ou expirado",
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("validate", () => {
  const schema = z.object({
    nome: z.string().trim().min(1, "nome obrigatório"),
    quantidade: z.coerce.number().int(),
  });

  test("substitui o body pelos dados validados e chama next", () => {
    const req = {
      body: { nome: "  Shape  ", quantidade: "2", extra: "remover" },
    };
    const next = jest.fn();
    validate(schema)(req, criarResposta(), next);
    expect(req.body).toEqual({ nome: "Shape", quantidade: 2 });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("responde 400 com issues mapeadas", () => {
    const res = criarResposta();
    const next = jest.fn();
    validate(schema)({ body: { nome: "", quantidade: "x" } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Dados inválidos",
      issues: expect.arrayContaining([
        { campo: "nome", mensagem: "nome obrigatório" },
        { campo: "quantidade", mensagem: expect.any(String) },
      ]),
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("errorHandler", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  test("notFound responde 404", () => {
    const res = criarResposta();
    notFound({}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Rota não encontrada" });
  });

  test("converte MulterError em resposta 400", () => {
    const res = criarResposta();
    errorHandler(new multer.MulterError("LIMIT_FILE_SIZE"), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringContaining("Erro no upload:"),
    });
  });

  test("converte rejeição do tipo de arquivo em resposta 400", () => {
    const res = criarResposta();
    const error = new Error("Apenas arquivos de imagem são permitidos");
    errorHandler(error, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });

  test.each([
    [{ message: "teapot", status: 418 }, 418, "teapot"],
    [{ message: "indisponível", statusCode: 503 }, 503, "indisponível"],
    [{}, 500, "Erro interno do servidor"],
  ])("responde erro centralizado", (error, status, message) => {
    const res = criarResposta();
    errorHandler(error, {}, res, jest.fn());
    expect(consoleError).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({ error: message });
  });
});

describe("upload", () => {
  const fileFilter = upload.fileFilter;

  test("usa armazenamento em memória e limite de 5 MB", () => {
    expect(upload.storage).toBeDefined();
    expect(upload.limits.fileSize).toBe(5 * 1024 * 1024);
  });

  test("aceita arquivos de imagem", () => {
    const callback = jest.fn();
    fileFilter({}, { mimetype: "image/png" }, callback);
    expect(callback).toHaveBeenCalledWith(null, true);
  });

  test("rejeita arquivos que não são imagem", () => {
    const callback = jest.fn();
    fileFilter({}, { mimetype: "application/pdf" }, callback);
    expect(callback).toHaveBeenCalledWith(expect.any(Error));
    expect(callback.mock.calls[0][0].message).toBe(
      "Apenas arquivos de imagem são permitidos"
    );
  });
});
