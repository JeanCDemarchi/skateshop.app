const { registerSchema, loginSchema } = require("../../src/utils/authSchemas");
const { createOrderSchema, METODOS_PAGAMENTO } = require("../../src/utils/orderSchemas");
const {
  createProductSchema,
  updateProductSchema,
} = require("../../src/utils/productSchemas");
const {
  changePasswordSchema,
  updateProfileSchema,
} = require("../../src/utils/userSchemas");

const registroValido = {
  username: "  skater  ",
  nome: "  Ana Silva  ",
  email: "ana@example.com",
  senha: "123456",
  confirmacaoSenha: "123456",
  endereco: "  Rua A, 10  ",
  cep: "12345-678",
};

describe("schemas de autenticação", () => {
  test("normaliza e aceita um cadastro válido", () => {
    expect(registerSchema.parse(registroValido)).toEqual({
      ...registroValido,
      username: "skater",
      nome: "Ana Silva",
      endereco: "Rua A, 10",
    });
  });

  test.each([
    ["username vazio", { username: " " }, "username"],
    ["nome vazio", { nome: " " }, "nome"],
    ["email inválido", { email: "ana" }, "email"],
    ["senha curta", { senha: "123", confirmacaoSenha: "123" }, "senha"],
    ["CEP inválido", { cep: "12345678" }, "cep"],
  ])("rejeita cadastro com %s", (_caso, alteracao, campo) => {
    const result = registerSchema.safeParse({ ...registroValido, ...alteracao });
    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.path[0] === campo)).toBe(true);
  });

  test("rejeita confirmação de senha diferente", () => {
    const result = registerSchema.safeParse({
      ...registroValido,
      confirmacaoSenha: "654321",
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(["confirmacaoSenha"]);
  });

  test("aceita e normaliza login válido", () => {
    expect(loginSchema.parse({ username: "  ana ", senha: "x" })).toEqual({
      username: "ana",
      senha: "x",
    });
  });

  test.each([
    [{ username: " ", senha: "x" }, "username"],
    [{ username: "ana", senha: "" }, "senha"],
  ])("rejeita login inválido", (body, campo) => {
    const result = loginSchema.safeParse(body);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual([campo]);
  });
});

describe("schemas de pedido", () => {
  test("expõe os métodos de pagamento aceitos", () => {
    expect(METODOS_PAGAMENTO).toEqual(["Cartao", "Pix", "Boleto"]);
  });

  test("converte strings numéricas e aceita pedido válido", () => {
    expect(
      createOrderSchema.parse({
        itens: [{ fkIdProduto: "2", quantidade: "3" }],
        metodoPagamento: "Pix",
      })
    ).toEqual({
      itens: [{ fkIdProduto: 2, quantidade: 3 }],
      metodoPagamento: "Pix",
    });
  });

  test.each(["Cartao", "Pix", "Boleto"])("aceita pagamento por %s", (metodoPagamento) => {
    expect(
      createOrderSchema.safeParse({
        itens: [{ fkIdProduto: 1, quantidade: 1 }],
        metodoPagamento,
      }).success
    ).toBe(true);
  });

  test.each([
    ["lista vazia", { itens: [], metodoPagamento: "Pix" }, "itens"],
    ["produto inválido", { itens: [{ fkIdProduto: 0, quantidade: 1 }], metodoPagamento: "Pix" }, "itens"],
    ["quantidade fracionária", { itens: [{ fkIdProduto: 1, quantidade: 1.5 }], metodoPagamento: "Pix" }, "itens"],
    ["pagamento inválido", { itens: [{ fkIdProduto: 1, quantidade: 1 }], metodoPagamento: "Dinheiro" }, "metodoPagamento"],
  ])("rejeita pedido com %s", (_caso, body, campo) => {
    const result = createOrderSchema.safeParse(body);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path[0]).toBe(campo);
  });
});

describe("schemas de produto", () => {
  test("normaliza produto multipart válido", () => {
    expect(
      createProductSchema.parse({
        nome: "  Shape  ",
        descricao: "  Maple  ",
        precoAtual: "199.90",
        estoqueAtual: "4",
        destaque: "TRUE",
      })
    ).toEqual({
      nome: "Shape",
      descricao: "Maple",
      precoAtual: 199.9,
      estoqueAtual: 4,
      destaque: true,
    });
  });

  test.each([undefined, null, "", "false", false, 0])(
    "normaliza destaque %p como falso",
    (destaque) => {
      const result = createProductSchema.parse({
        nome: "Shape",
        descricao: "Maple",
        precoAtual: 1,
        estoqueAtual: 0,
        destaque,
      });
      expect(result.destaque).toBe(false);
    }
  );

  test.each([
    ["nome vazio", { nome: " " }, "nome"],
    ["preço zero", { precoAtual: "0" }, "precoAtual"],
    ["estoque negativo", { estoqueAtual: "-1" }, "estoqueAtual"],
    ["estoque fracionário", { estoqueAtual: "1.5" }, "estoqueAtual"],
  ])("rejeita produto com %s", (_caso, alteracao, campo) => {
    const body = {
      nome: "Shape",
      descricao: "Maple",
      precoAtual: "10",
      estoqueAtual: "1",
      ...alteracao,
    };
    const result = createProductSchema.safeParse(body);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual([campo]);
  });

  test("aceita atualização parcial e converte os campos enviados", () => {
    expect(
      updateProductSchema.parse({
        nome: "  Shape Pro  ",
        precoAtual: "249.9",
        estoqueAtual: "8",
        destaque: "true",
      })
    ).toEqual({
      nome: "Shape Pro",
      precoAtual: 249.9,
      estoqueAtual: 8,
      destaque: true,
    });
  });

  test("ignora valores vazios nos campos opcionais normalizados", () => {
    expect(
      updateProductSchema.parse({
        precoAtual: "",
        estoqueAtual: null,
        destaque: "",
      })
    ).toEqual({
      precoAtual: undefined,
      estoqueAtual: undefined,
      destaque: undefined,
    });
  });
});

describe("schemas de usuário", () => {
  test("aceita alteração de senha válida", () => {
    const body = {
      senhaAtual: "antiga",
      novaSenha: "novasenha",
      confirmacaoNovaSenha: "novasenha",
    };
    expect(changePasswordSchema.parse(body)).toEqual(body);
  });

  test.each([
    ["senha atual ausente", { senhaAtual: "" }, "senhaAtual"],
    ["nova senha curta", { novaSenha: "123", confirmacaoNovaSenha: "123" }, "novaSenha"],
    ["confirmação diferente", { confirmacaoNovaSenha: "diferente" }, "confirmacaoNovaSenha"],
  ])("rejeita alteração com %s", (_caso, alteracao, campo) => {
    const result = changePasswordSchema.safeParse({
      senhaAtual: "antiga",
      novaSenha: "novasenha",
      confirmacaoNovaSenha: "novasenha",
      ...alteracao,
    });
    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.path[0] === campo)).toBe(true);
  });

  test("normaliza atualização parcial e remove campos não permitidos", () => {
    expect(
      updateProfileSchema.parse({
        nome: "  Ana  ",
        endereco: "  Rua A  ",
        cep: "12345-678",
        email: "ana@example.com",
        username: "invasor",
        role: "admin",
        senha: "segredo",
      })
    ).toEqual({
      nome: "Ana",
      endereco: "Rua A",
      cep: "12345-678",
      email: "ana@example.com",
    });
  });

  test.each([
    [{ nome: " " }, "nome"],
    [{ endereco: " " }, "endereco"],
    [{ cep: "12345678" }, "cep"],
    [{ email: "invalido" }, "email"],
  ])("rejeita atualização de perfil inválida", (body, campo) => {
    const result = updateProfileSchema.safeParse(body);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual([campo]);
  });
});
