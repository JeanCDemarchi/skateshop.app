jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcrypt = require("bcryptjs");
const prisma = require("../../src/config/prisma");
const service = require("../../src/services/user.service");

describe("user.service", () => {
  test("obter devolve usuário sem senha", async () => {
    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nome: "Ana",
      senha: "hash",
    });
    await expect(service.obter(1)).resolves.toEqual({ id: 1, nome: "Ana" });
  });

  test("obter rejeita usuário ausente", async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    await expect(service.obter(1)).rejects.toMatchObject({
      message: "Usuário não encontrado",
      status: 404,
    });
  });

  test("alterarSenha valida senha atual, gera hash e atualiza", async () => {
    prisma.usuario.findUnique.mockResolvedValue({ id: 1, senha: "hash-antiga" });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("hash-nova");
    prisma.usuario.update.mockResolvedValue({});
    await expect(
      service.alterarSenha(1, { senhaAtual: "antiga", novaSenha: "nova123" })
    ).resolves.toEqual({ message: "Senha alterada com sucesso" });
    expect(bcrypt.compare).toHaveBeenCalledWith("antiga", "hash-antiga");
    expect(bcrypt.hash).toHaveBeenCalledWith("nova123", 10);
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { senha: "hash-nova" },
    });
  });

  test("alterarSenha rejeita usuário ausente antes do bcrypt", async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    await expect(
      service.alterarSenha(1, { senhaAtual: "x", novaSenha: "y" })
    ).rejects.toMatchObject({ status: 404 });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test("alterarSenha rejeita senha atual incorreta", async () => {
    prisma.usuario.findUnique.mockResolvedValue({ senha: "hash" });
    bcrypt.compare.mockResolvedValue(false);
    await expect(
      service.alterarSenha(1, { senhaAtual: "errada", novaSenha: "nova" })
    ).rejects.toMatchObject({
      message: "senha atual incorreta",
      status: 401,
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  test("alterarSenha propaga falha externa de hash", async () => {
    const error = new Error("bcrypt fora");
    prisma.usuario.findUnique.mockResolvedValue({ senha: "hash" });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockRejectedValue(error);
    await expect(
      service.alterarSenha(1, { senhaAtual: "x", novaSenha: "y" })
    ).rejects.toBe(error);
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  test("atualizarPerfil verifica conflito de email com outro usuário", async () => {
    prisma.usuario.findFirst.mockResolvedValue({ id: 2 });
    await expect(
      service.atualizarPerfil(1, { email: "usado@example.com" })
    ).rejects.toMatchObject({
      message: "email já está em uso",
      status: 400,
    });
    expect(prisma.usuario.findFirst).toHaveBeenCalledWith({
      where: { email: "usado@example.com", NOT: { id: 1 } },
    });
    expect(prisma.usuario.update).not.toHaveBeenCalled();
  });

  test("atualizarPerfil atualiza campos permitidos e remove senha", async () => {
    prisma.usuario.findFirst.mockResolvedValue(null);
    prisma.usuario.update.mockResolvedValue({
      id: 1,
      nome: "Nova",
      email: "nova@example.com",
      senha: "hash",
    });
    await expect(
      service.atualizarPerfil(1, {
        nome: "Nova",
        endereco: "Rua B",
        cep: "11111-111",
        email: "nova@example.com",
      })
    ).resolves.toEqual({
      id: 1,
      nome: "Nova",
      email: "nova@example.com",
    });
  });

  test("atualizarPerfil sem email pula consulta de conflito", async () => {
    prisma.usuario.update.mockResolvedValue({ id: 1, nome: "Nova", senha: "hash" });
    await service.atualizarPerfil(1, { nome: "Nova" });
    expect(prisma.usuario.findFirst).not.toHaveBeenCalled();
    expect(prisma.usuario.update.mock.calls[0][0].data).toEqual({
      nome: "Nova",
      endereco: undefined,
      cep: undefined,
      email: undefined,
    });
  });

  test("atualizarPerfil propaga erro externo do Prisma", async () => {
    const error = new Error("unique constraint");
    prisma.usuario.update.mockRejectedValue(error);
    await expect(service.atualizarPerfil(1, { nome: "Nova" })).rejects.toBe(error);
  });
});
