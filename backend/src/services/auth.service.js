// Regras de negócio da autenticação: cadastro e login.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRATION = "7d";

// Remove o campo `senha` antes de devolver o usuário em qualquer resposta.
function semSenha(usuario) {
  const { senha, ...rest } = usuario;
  return rest;
}

async function register(dados) {
  const { username, nome, email, senha, endereco, cep } = dados;

  // Verifica duplicidade de username/email e indica qual está em uso.
  const existente = await prisma.usuario.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existente) {
    if (existente.username === username) {
      throw new AppError("username já está em uso", 400);
    }
    throw new AppError("email já está em uso", 400);
  }

  // Nunca armazenar a senha em texto puro.
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  // Segurança: o `role` NÃO é lido do corpo da requisição — todo novo
  // usuário é "cliente" (default do schema). Promover a admin é feito
  // manualmente no banco.
  const usuario = await prisma.usuario.create({
    data: { username, nome, email, senha: senhaHash, endereco, cep },
  });

  return semSenha(usuario);
}

async function login(dados) {
  const { username, senha } = dados;

  const usuario = await prisma.usuario.findUnique({ where: { username } });

  // Mensagem genérica: não revela se o username existe ou se a senha errou.
  if (!usuario) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senha);
  if (!senhaConfere) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const token = jwt.sign(
    { id: usuario.id, username: usuario.username, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );

  return { token, usuario: semSenha(usuario) };
}

module.exports = { register, login };
