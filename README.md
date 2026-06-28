# 🛹 Skateshop

Aplicativo **mobile de e-commerce** de uma loja de skate, com vitrine de produtos, detalhes, carrinho, checkout, pedidos e área administrativa.

**Arquitetura:** app **React Native / Expo** (frontend) + **API REST Node/Express** (backend) + **PostgreSQL e Storage de imagens no Supabase**.

---

## 1. Funcionalidades

**Cliente**
- Cadastro e login com **sessão persistente** (continua logado ao reabrir o app)
- Vitrine de produtos (Home) com dados reais da API
- **Busca de produtos** pela lupa (por nome/descrição)
- **Tela de detalhes do produto** com galeria de imagens
- Páginas **Novidades**, **Sobre** (conteúdo vindo da API) e **Contato** (com formulário)
- **Carrinho** (adicionar/remover) e **Checkout** com escolha de pagamento (Cartão/PIX/Boleto)
- Finalização de compra que **cria o pedido** e **baixa o estoque**
- **Histórico de pedidos** (lista os pedidos do usuário logado)
- **Perfil**: ver/editar dados e **alterar senha**

**Administrador**
- Painel de produtos (somente quem tem papel `admin`)
- **Cadastrar / editar / excluir** produtos, com **upload de imagens** do dispositivo
- Controle de estoque e preço
- Exclusão protegida: produto vinculado a pedidos **não** pode ser excluído

---

## 2. Estrutura de pastas

O **frontend** fica na **raiz** e o **backend** na pasta **`/backend`**.

```
skateshop.app/                 # FRONTEND (React Native / Expo)
├── App.js                     # ponto de entrada (AuthProvider + CartProvider + navegação)
├── app.json                   # configuração do Expo
├── .env.example               # modelo das variáveis do frontend
├── assets/                    # ícones e splash do app
├── src/
│   ├── assets/images/         # imagens locais usadas no app
│   ├── components/            # ProductCard, HeaderMenu, BottomMenu
│   ├── context/               # AuthContext (login/token) e CartContext (carrinho)
│   ├── navigation/            # AppNavigator (stack) e DrawerNavigator (menu lateral)
│   ├── screens/               # Login, Cadastro, Home, ProductDetail, News,
│   │                          #   About, Contact, Cart, Checkout, PaymentSuccess,
│   │                          #   Orders, Profile, ChangePassword, AdminHome,
│   │                          #   AddProduct, EditProduct
│   ├── services/              # api.js (axios) + produtoService, userService, aboutService
│   └── utils/                 # formatarPreco, erroApi, imagePicker
│
└── backend/                   # BACKEND (Node / Express / Prisma)
    ├── README.md              # contrato de API detalhado (corpo/resposta de cada rota)
    ├── .env.example           # modelo das variáveis do backend
    ├── prisma/
    │   ├── schema.prisma      # modelos do banco
    │   ├── migrations/        # histórico de migrations
    │   └── seed.js            # popula dados de teste
    └── src/
        ├── app.js / server.js # configuração do Express e subida do servidor
        ├── config/            # conexão Prisma e Supabase
        ├── controllers/       # auth, product, pedido, user, about
        ├── middlewares/       # auth (JWT), admin, validação (Zod), upload (Multer), erros
        ├── routes/            # /auth, /products, /orders, /users, /about
        ├── services/          # regras de negócio + storage (Supabase)
        └── utils/             # helpers e schemas de validação
```

---

## 3. Pré-requisitos

- **Node.js 20 LTS ou superior** (mínimo 18) — `node -v`
- **npm** (vem com o Node) — `npm -v`
- **Git**
- **Expo Go** no celular (Android/iOS), instalado pela loja de apps

> ⚠️ O **celular e o computador precisam estar na MESMA rede Wi-Fi**.

---

## 4. Clonar o projeto

```bash
git clone https://github.com/JeanCDemarchi/skateshop.app.git
cd skateshop.app
```

---

## 5. ⚠️ Configuração das credenciais (LEIA COM ATENÇÃO)

O projeto usa um **Supabase compartilhado** (banco PostgreSQL + Storage de imagens). Por segurança, as **credenciais reais NÃO estão no repositório** — solicite-as ao autor / consulte o documento de entrega. Use **placeholders** e substitua pelos valores reais.

### 5a. Backend — `backend/.env`

```bash
cd backend
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```

| Variável | O que é |
|---|---|
| `DATABASE_URL` | Conexão do Postgres (com pooler, porta 6543) usada pela aplicação |
| `DIRECT_URL` | Conexão direta (porta 5432), usada pelas migrations |
| `SUPABASE_URL` | URL do projeto Supabase (Storage de imagens) |
| `SUPABASE_SERVICE_KEY` | Service role key do Supabase (upload de imagens) |
| `JWT_SECRET` | Segredo para assinar os tokens de login |
| `PORT` | Porta do servidor (use `3333`) |

### 5b. Frontend — `.env` (na raiz)

```bash
cd ..
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
```

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3333
```

> 🔴 **NÃO use `http://localhost:3333`.** No celular, "localhost" é o próprio celular, não o seu PC. Use o **IP local** do computador que roda o backend.

**Como descobrir o IP local:**
- **Windows:** `ipconfig` → "Endereço IPv4" do adaptador **Wi-Fi** (ex.: `192.168.0.12`).
- **Mac/Linux:** `ifconfig` ou `ip addr` → IP da interface Wi-Fi.

> ⚠️ Ao **trocar de rede Wi-Fi**, o IP muda — atualize o `.env` e **reinicie o Expo** (`npx expo start -c`).

---

## 6. Rodar o BACKEND

A partir da pasta **`/backend`**:

```bash
cd backend
npm install               # 1. instalar dependências
npx prisma generate       # 2. gerar o Prisma Client
npx prisma migrate deploy # 3. aplicar as migrations no banco
npx prisma db seed        # 4. (opcional) popular dados de teste — ver aviso
npm run dev               # 5. subir o servidor
```

Deu certo quando aparecer no terminal:

```
🛹 Servidor da Skateshop rodando em http://localhost:3333
```

**Teste:** abra `http://localhost:3333/health` no navegador do PC → `{"status":"ok"}`.

> ⚠️ **Sobre o seed:** o `npx prisma db seed` **limpa e repopula** as tabelas. Como o banco é **compartilhado**, rode-o só quando fizer sentido (ou combine com a equipe). Se já estiver populado, pule o passo 4.

---

## 7. Rodar o FRONTEND

> O **backend precisa estar rodando antes**. A partir da **raiz** (em outro terminal):

```bash
npm install      # 1. instalar dependências
npx expo start   # 2. subir o Expo
```

Escaneie o **QR Code** com o **Expo Go** (Android: pelo app; iOS: pela câmera). O app abre na tela de **Login**.

---

## 8. Usuários de teste

O seed cria um **administrador**:

| Usuário | Senha |
|---|---|
| `admin` | `123456` |

> No login, digite o **usuário** (`admin`), não o e-mail. O admin entra na **área administrativa**. Quem se **cadastra pelo app** vira **cliente comum**.

---

## 9. Como testar de ponta a ponta

**Como cliente:**
1. Login → "Cadastre-se aqui" → criar conta → fazer login.
2. **Home**: toque em um produto ("Comprar") → abre a **tela de Detalhes**.
3. Em Detalhes, toque em **"Adicionar ao carrinho"**.
4. Abra o **Carrinho** (menu inferior) → **Finalizar compra**.
5. No **Checkout**, escolha o pagamento → **Finalizar compra** → confirmação.
6. Explore **Novidades / Sobre / Contato** (menu lateral ☰ ou barra do topo).

**Como administrador** (`admin` / `123456`):
1. Login → cai no painel de produtos.
2. Botão **+** para **cadastrar** (com fotos da galeria).
3. Ícones de **lápis** (editar) e **lixeira** (excluir).

**Conferir no banco (Supabase ou `npx prisma studio` em `/backend`):** após um checkout, há registros novos em `pedido`, `item_pedido`, `pagamento`, `envio`, e o `estoque_atual` do produto diminuiu.

---

## 10. API — Endpoints

Base URL: `http://SEU_IP:3333` · Legenda: 🔓 público · 🔒 requer token (`Authorization: Bearer <token>`) · 🔒👑 requer token de **admin**.

> Detalhes de corpo de requisição e exemplos de resposta estão no **[backend/README.md](backend/README.md)**.

### Saúde
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/health` | 🔓 | Verifica se a API está no ar → `{ status: "ok" }` |

### Autenticação — `/auth`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | Cadastra usuário (cliente). Body: `username, nome, email, senha, confirmacaoSenha, endereco, cep` → 201 |
| POST | `/auth/login` | 🔓 | Autentica. Body: `username, senha` → 200 `{ token, usuario }` |

### Produtos — `/products`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/products` | 🔓 | Lista produtos. Aceita `?destaque=true` para só os em destaque |
| GET | `/products/search?q=termo` | 🔓 | Busca por nome/descrição (case-insensitive) |
| GET | `/products/suggestions` | 🔓 | Até 4 produtos (seção "outros produtos" do checkout) |
| GET | `/products/:id` | 🔓 | Detalhe do produto com galeria de imagens (404 se não existir) |
| POST | `/products` | 🔒👑 | Cria produto (**multipart**: `nome, descricao, precoAtual, estoqueAtual, destaque, imagens[]`) → 201 |
| PUT | `/products/:id` | 🔒👑 | Edita produto (campos opcionais; multipart para novas imagens) → 200 / 404 |
| DELETE | `/products/:id` | 🔒👑 | Exclui produto → 200 / **409 se vinculado a pedidos** / 404 |

### Pedidos / Checkout — `/orders`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/orders` | 🔒 | Cria pedido. Body: `itens: [{ fkIdProduto, quantidade }], metodoPagamento` (`Cartao`/`Pix`/`Boleto`) → 201 / 400 (estoque) / 404 |
| GET | `/orders` | 🔒 | Lista os pedidos do usuário logado |
| GET | `/orders/:id` | 🔒 | Detalhe de um pedido (404 se não existir ou não for do usuário) |

### Usuário logado — `/users`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/users/me` | 🔒 | Dados do usuário logado (sem a senha) |
| PATCH | `/users/me` | 🔒 | Edita perfil. Campos opcionais: `nome, endereco, cep, email` → 200 / 400 |
| PATCH | `/users/me/password` | 🔒 | Altera senha. Body: `senhaAtual, novaSenha, confirmacaoNovaSenha` → 200 / 401 / 400 |

### Sobre — `/about`
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/about` | 🔓 | Conteúdo da página Sobre → `{ titulo, descricao, destaques: [] }` |

> **Endpoints adicionados ao longo do desenvolvimento** (além do login/cadastro inicial): gestão de produtos por admin (`POST` / `PUT` / `DELETE /products/:id`), busca (`/products/search`), sugestões (`/products/suggestions`), pedidos (`/orders`), área do usuário (`/users/me`, `/users/me/password`) e a página Sobre (`/about`).

---

## 11. Limitações conhecidas

> A tela de **Pedidos** (`GET /orders`) e a **busca pela lupa** (`GET /products/search`) já consomem os endpoints reais.

- O **frete** não é tratado pelo backend (aparece como `R$ 0,00`).
- No **checkout**, os campos de identificação/endereço do formulário são apenas visuais — o pedido usa o **usuário autenticado** (via token) para registrar quem comprou.

---

## 12. Solução de problemas (troubleshooting)

**App não conecta no backend / "Network Error":**
- Confirme que o **backend está rodando** (`npm run dev` em `/backend`).
- Cheque o **IP** em `EXPO_PUBLIC_API_URL` (rode `ipconfig`); se mudou, atualize e reinicie com `npx expo start -c`.
- **Celular e PC na mesma rede Wi-Fi**.
- **Firewall do Windows:** permita o Node/porta `3333` (especialmente em redes privadas).
- Teste pelo PC: `http://SEU_IP:3333/health`. Se responder, o problema é rede/firewall até o celular.

**Imagens dos produtos não aparecem:** ficam no Supabase Storage (URLs remotas) — o celular precisa de **internet**.

**Erro nas migrations / Prisma:** confira `DATABASE_URL`/`DIRECT_URL` no `backend/.env` e rode `npx prisma generate`.

**Rede isola dispositivos (faculdade/empresa):** use `npx expo start --tunnel` (pode pedir para instalar `@expo/ngrok`). Em redes muito restritas, prefira uma Wi-Fi comum (roteador de casa ou hotspot do celular).

---

## 13. Stack / Tecnologias

**Frontend:** React Native + Expo · React Navigation (Stack + Drawer) · Axios · Context API (auth e carrinho) · expo-secure-store (token) · expo-image-picker (fotos).

**Backend:** Node.js + Express · Prisma ORM · PostgreSQL (Supabase) · Supabase Storage (`@supabase/supabase-js`) · JWT (`jsonwebtoken`) + `bcryptjs` · validação com Zod · upload com Multer.

---

## 👨‍💻 Desenvolvedores

Arthur Risson · Caio De Prado · Eduardo Menegazzo Riboli · Jean Carlos Demarchi · Vitor Valduga Modesti

## 📄 Licença

Projeto desenvolvido para fins acadêmicos e de aprendizado.
