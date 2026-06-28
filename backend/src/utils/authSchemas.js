// Schemas de validação (Zod) para as rotas de autenticação.
const { z } = require("zod");

const registerSchema = z
  .object({
    username: z.string({ error: "username é obrigatório" }).trim().min(1, "username é obrigatório"),
    nome: z.string({ error: "nome é obrigatório" }).trim().min(1, "nome é obrigatório"),
    email: z.email({ error: "email em formato inválido" }),
    senha: z.string({ error: "senha é obrigatória" }).min(6, "a senha deve ter no mínimo 6 caracteres"),
    confirmacaoSenha: z.string({ error: "confirmacaoSenha é obrigatória" }).min(1, "confirmacaoSenha é obrigatória"),
    endereco: z.string({ error: "endereco é obrigatório" }).trim().min(1, "endereco é obrigatório"),
    cep: z.string({ error: "cep é obrigatório" }).regex(/^\d{5}-\d{3}$/, "cep deve estar no formato 00000-000"),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: "senha e confirmacaoSenha não conferem",
    path: ["confirmacaoSenha"],
  });

const loginSchema = z.object({
  username: z.string({ error: "username é obrigatório" }).trim().min(1, "username é obrigatório"),
  senha: z.string({ error: "senha é obrigatória" }).min(1, "senha é obrigatória"),
});

module.exports = { registerSchema, loginSchema };
