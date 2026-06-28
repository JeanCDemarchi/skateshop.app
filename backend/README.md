# Skateshop — Backend

API REST da Skateshop. **Node.js + Express + Prisma 6 (PostgreSQL/Supabase)**, JavaScript puro.
Este documento serve como **contrato de API** para o frontend.

---

## 1. Como rodar

### Pré-requisitos
- Node.js 18+ e npm
- Um banco PostgreSQL (o projeto usa Supabase)

### Passos

```bash
# 1. Instalar dependências (dentro de /backend)
npm install

# 2. Configurar o .env (veja as variáveis abaixo)
cp .env.example .env   # e preencha os valores

# 3. Aplicar as migrations (cria as tabelas)
npx prisma migrate deploy
# (em desenvolvimento, para criar/alterar tabelas: npx prisma migrate dev)

# 4. Gerar o Prisma Client
npx prisma generate

# 5. (Opcional) Popular o banco com dados de teste
npx prisma db seed

# 6. Subir o servidor
npm run dev     # com reload automático (nodemon)
# ou
npm start       # produção
```

Servidor sobe em `http://localhost:3333` (ou a porta definida em `PORT`).
Healthcheck: `GET /health` → `{ "status": "ok" }`.

### Variáveis de ambiente (`.env`)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Postgres (pooled, porta 6543 no Supabase) — usada pela aplicação |
| `DIRECT_URL` | Connection string direta (porta 5432) — usada nas migrations |
| `SUPABASE_URL` | URL do projeto Supabase (para o Storage) |
| `SUPABASE_SERVICE_KEY` | Service role key do Supabase (para upload de imagens) |
| `JWT_SECRET` | Segredo para assinar os tokens JWT |
| `PORT` | Porta do servidor (padrão: 3333) |

### Seed
Cria **1 usuário de teste** e **8 produtos**. É idempotente (limpa as tabelas antes de inserir).
- Login do usuário de teste: **`admin`** / senha **`123456`**

---

## 2. Autenticação

1. O cliente faz `POST /auth/login` com `username` e `senha`.
2. A resposta traz um **`token`** (JWT, validade de 7 dias).
3. Para acessar **rotas protegidas**, envie o token no header:
   ```
   Authorization: Bearer <token>
   ```
4. Sem o header (ou com token inválido/expirado), a resposta é **401**.

---

## 3. Formato dos dados

- Os campos são em **português** (ex.: `nome`, `descricao`, `precoAtual`, `estoqueAtual`).
- **Preços são números** (ex.: `299.9`), não strings.
- Datas em ISO 8601 (ex.: `"2026-06-26T18:00:00.000Z"`).
- O campo **`senha` nunca é retornado** em nenhuma resposta.

---

## 4. Endpoints

> Base URL: `http://localhost:3333`
> 🔒 = requer `Authorization: Bearer <token>`

### 4.1 Auth

#### `POST /auth/register` — Cadastro
Corpo:
```json
{
  "username": "joaoskater",
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "confirmacaoSenha": "123456",
  "endereco": "Rua das Trucks, 100",
  "cep": "01001-000"
}
```
Regras: todos obrigatórios; `email` válido; `senha` mínimo 6 caracteres; `cep` no formato `00000-000`; `senha` deve ser igual a `confirmacaoSenha`.

**201 Created**
```json
{
  "id": 1, "username": "joaoskater", "nome": "João Silva",
  "email": "joao@email.com", "endereco": "Rua das Trucks, 100",
  "cep": "01001-000", "criadoEm": "2026-06-26T18:00:00.000Z"
}
```
Erros: `400` (validação, ou username/email já em uso).

---

#### `POST /auth/login` — Login
Corpo:
```json
{ "username": "joaoskater", "senha": "123456" }
```
**200 OK**
```json
{
  "token": "eyJhbGciOiJIUzI1NiI...",
  "usuario": {
    "id": 1, "username": "joaoskater", "nome": "João Silva",
    "email": "joao@email.com", "endereco": "Rua das Trucks, 100",
    "cep": "01001-000", "criadoEm": "2026-06-26T18:00:00.000Z"
  }
}
```
Erros: `400` (validação), `401` (`Credenciais inválidas`).

---

### 4.2 Products

#### `GET /products` — Lista produtos
Query opcional: `?destaque=true` (retorna só os produtos em destaque).

**200 OK**
```json
[
  {
    "id": 1, "nome": "Shape Maple 8.0", "descricao": "Shape profissional...",
    "precoAtual": 299.9, "estoqueAtual": 20, "destaque": true, "fkIdCriador": 1,
    "imagens": [
      { "id": 1, "fkIdProduto": 1, "url": "https://.../img1.png", "principal": true },
      { "id": 2, "fkIdProduto": 1, "url": "https://.../img2.png", "principal": false }
    ]
  }
]
```

#### `GET /products/search?q=termo` — Busca
Busca por `nome` OU `descricao` (case-insensitive). **200 OK** com lista (pode ser vazia), mesmo formato acima.

#### `GET /products/suggestions` — Sugestões
Até 4 produtos (mais recentes) para a seção "outros produtos" do checkout. **200 OK**, lista no mesmo formato.

#### `GET /products/:id` — Detalhe (galeria)
**200 OK** com o produto e todas as imagens. `404` se não existir.

#### 🔒 `POST /products` — Criar produto
**Protegido.** Enviar como **`multipart/form-data`**:

| Campo | Tipo | Obrigatório |
|---|---|---|
| `nome` | texto | sim |
| `descricao` | texto | sim |
| `precoAtual` | texto (número > 0) | sim |
| `estoqueAtual` | texto (inteiro ≥ 0) | sim |
| `destaque` | texto (`true`/`false`) | não (padrão false) |
| `imagens` | arquivo(s) de imagem | sim (1 ou mais) |

As imagens vão para o Supabase Storage (bucket `produtos`). A **primeira** vira `principal: true`.
O produto é criado com `fkIdCriador` = id do usuário autenticado.

**201 Created** com o produto criado (incluindo `imagens`).
Erros: `400` (validação / sem imagem), `401` (sem token).

---

### 4.3 Orders (Checkout) — todas 🔒

> Não há carrinho no backend. O frontend envia os itens escolhidos e o backend cria o pedido.

#### 🔒 `POST /orders` — Finalizar compra
Corpo (JSON):
```json
{
  "itens": [
    { "fkIdProduto": 1, "quantidade": 2 },
    { "fkIdProduto": 3, "quantidade": 1 }
  ],
  "metodoPagamento": "Pix"
}
```
- `itens`: array não vazio; `quantidade` inteiro > 0.
- `metodoPagamento`: um de `"Cartao"`, `"Pix"`, `"Boleto"`.
- O backend usa o **preço do banco** (ignora qualquer preço do frontend), valida estoque e decrementa o estoque. Tudo numa transação.

**201 Created**
```json
{
  "id": 1, "status": "Pendente", "dataPedido": "2026-06-26T18:00:00.000Z",
  "valorTotal": 899.7, "fkIdUsuario": 1,
  "itens": [
    { "id": 1, "fkIdProduto": 1, "quantidade": 2, "precoUnitarioVenda": 299.9,
      "produto": { "id": 1, "nome": "Shape Maple 8.0", "precoAtual": 299.9, "...": "..." } }
  ],
  "pagamento": {
    "id": 1, "metodoPagamento": "Pix", "statusTransacao": "Aprovado",
    "dataPagamento": "2026-06-26T18:00:00.000Z", "idTransacaoGateway": "SIMULADO-..."
  },
  "envio": {
    "id": 1, "statusEntrega": "Em preparação",
    "codigoRastreio": null, "transportadora": null, "dataPostagem": null
  }
}
```
Erros: `400` (validação / estoque insuficiente), `401` (sem token), `404` (produto inexistente).

#### 🔒 `GET /orders` — Meus pedidos
**200 OK** com a lista de pedidos do usuário logado (cada um com `itens` + `produto`, `pagamento`, `envio`). Lista pode ser vazia.

#### 🔒 `GET /orders/:id` — Detalhe do pedido
**200 OK** com o pedido (mesmo formato do POST). `404` se não existir **ou** não pertencer ao usuário logado.

---

### 4.4 About

#### `GET /about` — Página "Sobre"
**200 OK**
```json
{
  "titulo": "Skateshop",
  "descricao": "A Skateshop é uma loja especializada em skate...",
  "destaques": [
    "Produtos selecionados das melhores marcas",
    "Entrega para todo o Brasil",
    "Montagem e curadoria por skatistas",
    "Suporte e atendimento especializado"
  ]
}
```

---

## 5. Códigos de status usados

| Código | Significado |
|---|---|
| 200 | OK (consultas) |
| 201 | Criado (cadastro, produto, pedido) |
| 400 | Erro de validação / regra de negócio (ex.: estoque) |
| 401 | Não autenticado (token ausente/ inválido) |
| 404 | Recurso não encontrado |
| 500 | Erro interno |

Respostas de erro têm o formato:
```json
{ "error": "mensagem" }
```
Erros de validação incluem detalhes:
```json
{ "error": "Dados inválidos", "issues": [ { "campo": "email", "mensagem": "email em formato inválido" } ] }
```

---

## 6. Estrutura do projeto

```
src/
├── app.js              # configura express, cors, json, monta rotas
├── server.js           # sobe o servidor
├── config/             # prisma (instância única) e supabase
├── routes/             # auth, product, order, about
├── controllers/        # recebem req → chamam services → respondem
├── services/           # regra de negócio (auth, product, pedido, storage)
├── middlewares/        # auth (JWT), validate (Zod), upload (multer), errorHandler
└── utils/              # asyncHandler, AppError, schemas Zod
prisma/
├── schema.prisma       # modelos e índices
└── seed.js             # dados de teste
```
