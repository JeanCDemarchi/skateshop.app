jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../src/config/prisma");
const { register, login } = require("../../src/services/auth.service");

const dadosCadastro = {
  username: "ana",
  nome: "Ana",
  email: "ana@example.com",
  senha: "segredo",
  endereco: "Rua A",
  cep: "12345-678",
  role: "admin",
};

describe("auth.service", () => {
  describe("register", () => {
    test("cria cliente com senha criptografada e não devolve a senha", async () => {
      prisma.usuario.findFirst.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hash-seguro");
      prisma.usuario.create.mockResolvedValue({
        id: 1,
        ...dadosCadastro,
        senha: "hash-seguro",
        role: "cliente",
      });

      const result = await register(dadosCadastro);

      expect(prisma.usuario.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ username: "ana" }, { email: "ana@example.com" }],
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("segredo", 10);
      expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: {
          username: "ana",
          nome: "Ana",
          email: "ana@example.com",
          senha: "hash-seguro",
          endereco: "Rua A",
          cep: "12345-678",
        },
      });
      expect(result).not.toHaveProperty("senha");
      expect(result.role).toBe("cliente");
    });

    test("rejeita username em uso", async () => {
      prisma.usuario.findFirst.mockResolvedValue({
        username: "ana",
        email: "outro@example.com",
      });
      await expect(register(dadosCadastro)).rejects.toMatchObject({
        message: "username já está em uso",
        status: 400,
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    test("rejeita email em uso", async () => {
      prisma.usuario.findFirst.mockResolvedValue({
        username: "outra",
        email: "ana@example.com",
      });
      await expect(register(dadosCadastro)).rejects.toMatchObject({
        message: "email já está em uso",
        status: 400,
      });
    });

    test("propaga falha externa ao gerar hash", async () => {
      const error = new Error("bcrypt indisponível");
      prisma.usuario.findFirst.mockResolvedValue(null);
      bcrypt.hash.mockRejectedValue(error);
      await expect(register(dadosCadastro)).rejects.toBe(error);
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    test("autentica, assina JWT e remove a senha da resposta", async () => {
      const segredoAnterior = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "segredo-teste";
      const usuario = {
        id: 2,
        username: "ana",
        nome: "Ana",
        senha: "hash",
        role: "cliente",
      };
      prisma.usuario.findUnique.mockResolvedValue(usuario);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token-assinado");

      const result = await login({ username: "ana", senha: "segredo" });

      expect(bcrypt.compare).toHaveBeenCalledWith("segredo", "hash");
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 2, username: "ana", role: "cliente" },
        "segredo-teste",
        { expiresIn: "7d" }
      );
      expect(result).toEqual({
        token: "token-assinado",
        usuario: { id: 2, username: "ana", nome: "Ana", role: "cliente" },
      });
      process.env.JWT_SECRET = segredoAnterior;
    });

    test("não revela quando o usuário não existe", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      await expect(login({ username: "ausente", senha: "x" })).rejects.toMatchObject({
        message: "Credenciais inválidas",
        status: 401,
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test("não revela quando a senha está errada", async () => {
      prisma.usuario.findUnique.mockResolvedValue({ senha: "hash" });
      bcrypt.compare.mockResolvedValue(false);
      await expect(login({ username: "ana", senha: "errada" })).rejects.toMatchObject({
        message: "Credenciais inválidas",
        status: 401,
      });
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test("propaga falha externa de comparação", async () => {
      const error = new Error("bcrypt falhou");
      prisma.usuario.findUnique.mockResolvedValue({ senha: "hash" });
      bcrypt.compare.mockRejectedValue(error);
      await expect(login({ username: "ana", senha: "x" })).rejects.toBe(error);
    });
  });
});
