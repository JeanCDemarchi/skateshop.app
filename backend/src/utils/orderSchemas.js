// Schema de validação (Zod) para criação de pedido (checkout).
const { z } = require("zod");

const METODOS_PAGAMENTO = ["Cartao", "Pix", "Boleto"];

const itemSchema = z.object({
  fkIdProduto: z.coerce
    .number({ error: "fkIdProduto deve ser um número" })
    .int("fkIdProduto deve ser um inteiro")
    .positive("fkIdProduto inválido"),
  quantidade: z.coerce
    .number({ error: "quantidade deve ser um número" })
    .int("quantidade deve ser um inteiro")
    .positive("quantidade deve ser maior que 0"),
});

const createOrderSchema = z.object({
  itens: z
    .array(itemSchema, { error: "itens é obrigatório" })
    .min(1, "itens não pode ser vazio"),
  metodoPagamento: z.enum(METODOS_PAGAMENTO, {
    error: `metodoPagamento deve ser um de: ${METODOS_PAGAMENTO.join(", ")}`,
  }),
});

module.exports = { createOrderSchema, METODOS_PAGAMENTO };
