// Schemas de validação (Zod) para alteração de senha e edição de perfil.
const { z } = require("zod");

const changePasswordSchema = z
  .object({
    senhaAtual: z.string({ error: "senhaAtual é obrigatória" }).min(1, "senhaAtual é obrigatória"),
    novaSenha: z.string({ error: "novaSenha é obrigatória" }).min(6, "a nova senha deve ter no mínimo 6 caracteres"),
    confirmacaoNovaSenha: z
      .string({ error: "confirmacaoNovaSenha é obrigatória" })
      .min(1, "confirmacaoNovaSenha é obrigatória"),
  })
  .refine((data) => data.novaSenha === data.confirmacaoNovaSenha, {
    message: "novaSenha e confirmacaoNovaSenha não conferem",
    path: ["confirmacaoNovaSenha"],
  });

// Edição parcial do perfil. username, senha e role NÃO entram aqui — o Zod
// descarta chaves desconhecidas, então mesmo que sejam enviadas, são ignoradas.
const updateProfileSchema = z.object({
  nome: z.string().trim().min(1, "nome não pode ser vazio").optional(),
  endereco: z.string().trim().min(1, "endereco não pode ser vazio").optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/, "cep deve estar no formato 00000-000").optional(),
  email: z.email("email em formato inválido").optional(),
});

module.exports = { changePasswordSchema, updateProfileSchema };
