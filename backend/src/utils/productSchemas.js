// Schema de validação (Zod) para criação de produto.
// Observação: como os dados chegam via multipart/form-data, os campos de
// texto vêm como string — por isso usamos coerção (números) e preprocess
// (boolean) para normalizá-los antes da validação.
const { z } = require("zod");

const paraBoolean = (val) => {
  if (val === undefined || val === null || val === "") return false;
  if (typeof val === "string") return val.toLowerCase() === "true";
  return Boolean(val);
};

const createProductSchema = z.object({
  nome: z.string({ error: "nome é obrigatório" }).trim().min(1, "nome é obrigatório"),
  descricao: z.string({ error: "descricao é obrigatória" }).trim().min(1, "descricao é obrigatória"),
  precoAtual: z.coerce
    .number({ error: "precoAtual deve ser um número" })
    .positive("precoAtual deve ser maior que 0"),
  estoqueAtual: z.coerce
    .number({ error: "estoqueAtual deve ser um número" })
    .int("estoqueAtual deve ser um número inteiro")
    .min(0, "estoqueAtual não pode ser negativo"),
  destaque: z.preprocess(paraBoolean, z.boolean()).default(false),
});

// Converte string vazia / null em undefined, para que o campo seja
// simplesmente ignorado na atualização parcial (Prisma ignora undefined).
const vazioParaUndefined = (val) => (val === "" || val === null ? undefined : val);

// Atualização parcial: todos os campos opcionais; valida apenas os enviados.
const updateProductSchema = z.object({
  nome: z.string().trim().min(1, "nome não pode ser vazio").optional(),
  descricao: z.string().trim().min(1, "descricao não pode ser vazia").optional(),
  precoAtual: z.preprocess(
    vazioParaUndefined,
    z.coerce
      .number({ error: "precoAtual deve ser um número" })
      .positive("precoAtual deve ser maior que 0")
      .optional()
  ),
  estoqueAtual: z.preprocess(
    vazioParaUndefined,
    z.coerce
      .number({ error: "estoqueAtual deve ser um número" })
      .int("estoqueAtual deve ser um número inteiro")
      .min(0, "estoqueAtual não pode ser negativo")
      .optional()
  ),
  destaque: z.preprocess(
    (val) => (val === undefined || val === null || val === "" ? undefined : paraBoolean(val)),
    z.boolean().optional()
  ),
});

module.exports = { createProductSchema, updateProductSchema };
