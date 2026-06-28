# 🛹 Skateshop

Aplicativo **mobile de e-commerce** de uma loja de skate, com vitrine de produtos, carrinho, checkout e área administrativa.

**Arquitetura:** app **React Native / Expo** (frontend) + **API REST Node/Express** (backend) + **PostgreSQL e Storage de imagens no Supabase**.

---

## 1. Visão geral / Estrutura de pastas

O **frontend** fica na **raiz** do projeto e o **backend** na pasta **`/backend`**.

```
skateshop.app/                 # FRONTEND (React Native / Expo)
├── App.js                     # ponto de entrada (providers + navegação)
├── app.json                   # configuração do Expo
├── .env.example               # modelo das variáveis do frontend
├── assets/                    # ícones e splash do app
├── src/
│   ├── assets/images/         # imagens usadas nas telas
│   ├── components/            # componentes reutilizáveis (ProductCard, menus...)
│   ├── context/               # AuthContext (login/token) e CartContext (carrinho)
│   ├── navigation/            # AppNavigator (stack) e DrawerNavigator (menu)
│   ├── screens/               # telas (Login, Home, Cart, Checkout, Admin...)
│   ├── services/              # api.js (axios) + serviços (produtos, usuário)
│   └── utils/                 # helpers (formatarPreco, erroApi, imagePicker)
│
└── backend/                   # BACKEND (Node / Express / Prisma)
    ├── .env.example           # modelo das variáveis do backend
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma      # modelos do banco
    │   ├── migrations/        # histórico de migrations
    │   └── seed.js            # popula dados de teste
    └── src/
        ├── app.js / server.js # configuração do Express e subida do servidor
        ├── config/            # conexão Prisma e Supabase
        ├── controllers/       # auth, product, pedido, user, about
        ├── middlewares/       # auth (JWT), admin, validação, upload, erros
        ├── routes/            # /auth, /products, /orders, /users, /about
        ├── services/          # regras de negócio
        └── utils/             # helpers e schemas de validação (Zod)
```

---

## 2. Pré-requisitos

Instale na sua máquina:

- **Node.js 20 LTS ou superior** (mínimo 18) — verifique com `node -v`
- **npm** (vem com o Node) — `npm -v`
- **Git**
- **Expo Go** no celular (Android/iOS), instalado pela loja de apps

> ⚠️ O **celular e o computador precisam estar na MESMA rede Wi-Fi** para o app acessar o backend.

---

## 3. Clonar o projeto

```bash
git clone https://github.com/JeanCDemarchi/skateshop.app.git
cd skateshop.app
```

---

## 4. ⚠️ Configuração das credenciais (LEIA COM ATENÇÃO)

O projeto usa um **Supabase compartilhado** (banco PostgreSQL + Storage de imagens). Por segurança, as **credenciais reais NÃO estão no repositório** — solicite-as ao autor do projeto / consulte o documento de entrega. Abaixo, use **placeholders** e substitua pelos valores reais.

### 4a. Backend — `backend/.env`

Copie o modelo e preencha:

```bash
cd backend
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```

| Variável | O que é |
|---|---|
| `DATABASE_URL` | String de conexão do Postgres (com pooler, porta 6543) usada pela aplicação |
| `DIRECT_URL` | String de conexão direta (porta 5432), usada pelas migrations |
| `SUPABASE_URL` | URL do projeto Supabase (para o Storage de imagens) |
| `SUPABASE_SERVICE_KEY` | Service role key do Supabase (upload de imagens) |
| `JWT_SECRET` | Segredo usado para assinar os tokens de login |
| `PORT` | Porta do servidor (use `3333`) |

### 4b. Frontend — `.env` (na raiz)

Volte para a raiz, copie o modelo e preencha **a variável mais importante**:

```bash
cd ..
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
```

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3333
```

> 🔴 **NÃO use `http://localhost:3333`.** No celular, "localhost" é o próprio celular, não o seu PC. Use o **IP local** do computador que está rodando o backend.

**Como descobrir o IP local:**
- **Windows:** abra o Prompt de Comando, rode `ipconfig` e procure o **"Endereço IPv4"** do adaptador **Wi-Fi** (algo como `192.168.0.12`).
- **Mac/Linux:** rode `ifconfig` ou `ip addr` e procure o IP da interface Wi-Fi (ex.: `192.168.x.x`).

Exemplo final: `EXPO_PUBLIC_API_URL=http://192.168.0.12:3333`

> ⚠️ Ao **trocar de rede Wi-Fi**, o IP muda — atualize o `.env` e **reinicie o Expo** (`npx expo start -c`) para a nova variável ser lida.

---

## 5. Rodar o BACKEND

A partir da pasta **`/backend`**:

```bash
cd backend

# 1. Instalar dependências
npm install

# 2. Gerar o Prisma Client
npx prisma generate

# 3. Aplicar as migrations no banco
npx prisma migrate deploy

# 4. (Opcional) Popular dados de teste — ver aviso abaixo
npx prisma db seed

# 5. Subir o servidor
npm run dev
```

Deu certo quando o terminal mostrar:

```
🛹 Servidor da Skateshop rodando em http://localhost:3333
```

**Teste a API:** abra no navegador do PC `http://localhost:3333/health` → deve responder `{"status":"ok"}`.

> ⚠️ **Sobre o seed:** o `npx prisma db seed` **limpa e repopula** as tabelas (apaga os dados existentes antes de inserir). Como o banco é **compartilhado**, rode-o só quando fizer sentido (ou combine com a equipe), para não apagar dados de outras pessoas. Se o banco já estiver populado, você pode pular o passo 4.

---

## 6. Rodar o FRONTEND

> O **backend precisa estar rodando antes**. A partir da **raiz** do projeto (em outro terminal):

```bash
# 1. Instalar dependências
npm install

# 2. Subir o Expo
npx expo start
```

Vai aparecer um **QR Code** no terminal. Abra o **Expo Go** no celular e **escaneie o QR Code** (Android: pelo próprio app; iOS: pela câmera). O app abrirá na tela de **Login**.

---

## 7. Usuários de teste

O seed cria um usuário **administrador**:

| Campo | Valor |
|---|---|
| **Usuário** | `admin` |
| **Senha** | `123456` |

> No login, digite o **usuário** (`admin`), não o e-mail. O admin entra direto na **área administrativa** de produtos.
>
> Qualquer pessoa que se **cadastrar pelo app** vira um **cliente comum** (sem acesso à área de admin).

---

## 8. Como testar de ponta a ponta

**Como cliente:**
1. Na tela de Login, toque em **"Cadastre-se aqui"** e crie uma conta → faça login.
2. Na **Home**, veja a vitrine de produtos.
3. Toque em **"Comprar"** em alguns produtos (vai para o carrinho).
4. Abra o **Carrinho** (menu inferior) → confira os itens → **Finalizar compra**.
5. No **Checkout**, escolha a forma de pagamento (Cartão/PIX/Boleto) e **Finalizar compra** → confirmação do pedido.

**Como administrador** (`admin` / `123456`):
1. Faça login → você cai no painel de produtos.
2. Toque no **+** para **cadastrar** um produto (com fotos da galeria).
3. Use os ícones de **lápis** (editar) e **lixeira** (excluir) em cada produto.

---

## 9. Solução de problemas (troubleshooting)

**O app não conecta no backend / "Network Error":**
- Confirme que o **backend está rodando** (`npm run dev` em `/backend`).
- Confira o **IP** no `.env` do frontend (`EXPO_PUBLIC_API_URL`) — rode `ipconfig` de novo; se o IP mudou, atualize e reinicie o Expo com `npx expo start -c`.
- Garanta que **celular e PC estão na mesma rede Wi-Fi**.
- **Firewall do Windows:** na primeira vez que o Node sobe, permita o acesso (especialmente em **redes privadas**). Se bloqueou, libere o Node/porta `3333`.
- Teste pelo PC: abra `http://SEU_IP:3333/health` no navegador. Se responder, o problema é rede/firewall até o celular.

**As imagens dos produtos não aparecem:**
- As imagens ficam no **Supabase Storage** (URLs remotas). O celular precisa de **internet** para carregá-las.

**Erro ao rodar as migrations / Prisma:**
- Verifique `DATABASE_URL` e `DIRECT_URL` no `backend/.env` (credenciais corretas do Supabase).
- Rode `npx prisma generate` antes de subir o servidor.

**Rede da faculdade/empresa isola dispositivos (o QR conecta mas o app não acha o backend):**
- Suba o Expo em modo túnel: `npx expo start --tunnel` (cria um túnel público; pode pedir para instalar `@expo/ngrok` na primeira vez).
- Observação: o `--tunnel` ajuda o **Expo** a alcançar o celular, mas a chamada à **API** ainda usa o `EXPO_PUBLIC_API_URL`. Em redes muito restritas, o ideal é usar uma rede Wi-Fi comum (ex.: roteador de casa ou hotspot do celular).

---

## 10. Stack / Tecnologias

**Frontend**
- React Native + Expo
- React Navigation (Stack + Drawer)
- Axios (cliente HTTP)
- Context API (autenticação e carrinho)
- expo-secure-store (token), expo-image-picker (upload de fotos)

**Backend**
- Node.js + Express
- Prisma ORM
- PostgreSQL (Supabase)
- Supabase Storage (imagens) via `@supabase/supabase-js`
- Autenticação JWT (`jsonwebtoken`) + hash de senha (`bcryptjs`)
- Validação com Zod, upload com Multer

---

## 👨‍💻 Desenvolvedores

Arthur Risson · Caio De Prado · Eduardo Menegazzo Riboli · Jean Carlos Demarchi · Vitor Valduga Modesti

## 📄 Licença

Projeto desenvolvido para fins acadêmicos e de aprendizado.
