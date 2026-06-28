// Regras de negócio do usuário logado (perfil e senha).
const bcrypt = require("bcryptjs");

const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 10;

// Remove o campo `senha` antes de devolver o usuário.
function semSenha(usuario) {
  const { senha, ...rest } = usuario;
  return rest;
}

// Retorna os dados do usuário logado (sem a senha).
async function obter(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    throw new AppError("Usuário não encontrado", 404);
  }
  return semSenha(usuario);
}

// Altera a senha do próprio usuário, exigindo a senha atual correta.
async function alterarSenha(id, { senhaAtual, novaSenha }) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) {
    throw new AppError("Usuário não encontrado", 404);
  }

  const confere = await bcrypt.compare(senhaAtual, usuario.senha);
  if (!confere) {
    throw new AppError("senha atual incorreta", 401);
  }

  const novaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
  await prisma.usuario.update({ where: { id }, data: { senha: novaHash } });

  return { message: "Senha alterada com sucesso" };
}

// Edição parcial do perfil. Só altera nome/endereco/cep/email.
async function atualizarPerfil(id, dados) {
  // Se o email for alterado, garante que não está em uso por OUTRO usuário.
  if (dados.email !== undefined) {
    const existente = await prisma.usuario.findFirst({
      where: { email: dados.email, NOT: { id } },
    });
    if (existente) {
      throw new AppError("email já está em uso", 400);
    }
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data: {
      nome: dados.nome,
      endereco: dados.endereco,
      cep: dados.cep,
      email: dados.email,
    },
  });

  return semSenha(usuario);
}

module.exports = { obter, alterarSenha, atualizarPerfil };
