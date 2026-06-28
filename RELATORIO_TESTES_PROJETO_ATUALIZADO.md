# Relatório Final de Qualidade e Testes — SkateShop

## 1. Identificação

- **Projeto:** SkateShop
- **Data:** 28 de junho de 2026
- **Responsável:** Arthur Risson — Engenheiro de Qualidade
- **Tecnologias:** Expo SDK 54, React Native 0.81, React 19.1, Node.js, Express, Jest, jest-expo, React Native Testing Library, Prisma e Supabase.
- **Branch validada:** `qa/testes-projeto-atual`

## 2. Objetivo

O trabalho teve como objetivo estruturar uma base de testes automatizados com Jest para o projeto atualizado da SkateShop. A meta mínima estabelecida foi de 85% para statements, branches, functions e lines no frontend, acompanhada de cobertura unitária das principais camadas do backend.

Além do indicador numérico, a suíte busca:

- proteger o sistema contra regressões;
- funcionar como documentação viva do comportamento implementado;
- detectar defeitos antes da publicação em produção;
- tornar refatorações futuras mais seguras;
- separar falhas de regra de negócio de falhas em integrações externas.

## 3. Escopo

### 3.1 Frontend

O frontend possui testes para:

- utils;
- services;
- contexts;
- componentes;
- telas;
- navegação;
- `App.js`;
- `index.js`.

A coleta de cobertura inclui todo o código JavaScript atual em `src`, além de `App.js` e `index.js`. Somente arquivos de teste e assets são retirados da instrumentação.

### 3.2 Backend

O backend possui testes unitários para:

- schemas Zod;
- utils;
- middlewares;
- services;
- controllers;
- configurações do Prisma e Supabase.

As rotas HTTP, `backend/src/app.js` e `backend/src/server.js` **não receberam testes de integração**. Portanto, a cobertura de 100% apresentada pela configuração oficial do backend se refere somente às camadas unitárias listadas no `collectCoverageFrom`, e não a todo o diretório `backend/src`.

## 4. Estratégia de testes

### 4.1 Pirâmide de testes

A estratégia adotada prioriza a base da pirâmide de testes: muitos testes unitários, rápidos, isolados e determinísticos. Testes de integração HTTP e testes ponta a ponta permanecem como evolução futura.

O escopo implementado neste trabalho é predominantemente **unitário**. Cada módulo é exercitado com suas dependências externas substituídas por doubles controlados.

### 4.2 Padrão AAA

Os testes seguem o padrão AAA:

1. **Arrange:** preparação dos dados, estado, mocks e respostas simuladas;
2. **Act:** execução da função, evento de interface ou middleware;
3. **Assert:** verificação do resultado, chamada, navegação, estado ou erro esperado.

### 4.3 Mocks, stubs e spies

- **Mocks** substituem dependências e permitem verificar como foram chamadas.
- **Stubs** devolvem respostas previamente controladas, como sucesso, vazio ou erro.
- **Spies** observam funções existentes, por exemplo `Alert.alert`, sem acessar recursos externos.

Foram simulados:

- Prisma e suas operações;
- Supabase Storage e `createClient`;
- Axios e interceptors;
- SecureStore;
- ImagePicker;
- React Navigation;
- Alert;
- módulos nativos do Expo e ícones.

Nenhuma rede, banco de dados, instância real do Supabase ou dispositivo físico foi acessado durante os testes. Também não foram executados servidor, migrations ou seed.

## 5. Resultados confirmados

Os números abaixo foram obtidos por nova execução local das suítes em 28 de junho de 2026.

### 5.1 Execução

| Aplicação | Suítes | Testes aprovados | Falhas |
|---|---:|---:|---:|
| Frontend | 16 | 119 | 0 |
| Backend | 14 | 195 | 0 |
| **Total** | **30** | **314** | **0** |

O frontend apresentou um aviso assíncrono do `VirtualizedList` relacionado a `act`, sem falha de teste. Esse aviso deve ser acompanhado, mas não alterou o resultado da execução.

### 5.2 Cobertura do frontend

| Métrica | Resultado | Meta mínima |
|---|---:|---:|
| Statements | 99,48% | 85% |
| Branches | 88,31% | 85% |
| Functions | 99,29% | 85% |
| Lines | 100% | 85% |

Todas as métricas superaram a meta acadêmica.

### 5.3 Cobertura configurada do backend

A coleta oficial contempla `utils`, `middlewares`, `services`, `controllers` e `config`:

| Métrica | Resultado |
|---|---:|
| Statements | 100% |
| Branches | 100% |
| Functions | 100% |
| Lines | 100% |

### 5.4 Limitação da cobertura do backend completo

Uma medição complementar, instrumentando todo `backend/src`, produziu:

| Métrica | Todo `backend/src` |
|---|---:|
| Statements | 79,85% |
| Branches | 98,57% |
| Functions | 96,92% |
| Lines | 79,34% |

A redução ocorre porque os arquivos de rotas, `app.js` e `server.js` permanecem sem testes de integração. Logo, não se deve interpretar a cobertura unitária configurada de 100% como cobertura integral do backend.

## 6. Inventário dos testes

### 6.1 Frontend

| Área | Arquivos de produção testados | Casos | Comportamentos validados |
|---|---|---:|---|
| Utils | `erroApi.js`, `formatarPreco.js`, `imagePicker.js` | 25 | Formatação, mensagens de erro, permissão, cancelamento e conversão de imagens |
| Services | `api.js`, `produtoService.js`, `userService.js` | 25 | Endpoints, payloads, multipart, interceptor JWT, respostas e erros |
| Contexts | `AuthContext.js`, `CartContext.js` | 24 | Sessão, login, registro, logout, persistência simulada, carrinho e totais |
| Componentes | `ProductCard.js`, `HeaderMenu.js`, `BottomMenu.js` | 3 | Renderização, callbacks, Alert e navegação |
| Telas | 15 telas atuais | 38 | Formulários, loading, vazio, sucesso, erro, checkout, administração e permissões |
| Navegação | `AppNavigator.js`, `DrawerNavigator.js` | 2 | Registro das rotas e rota inicial |
| Composição | `App.js` | 1 | Hierarquia de providers e navegador |
| Inicialização | `index.js` | 1 | Registro do componente raiz |
| **Total frontend** |  | **119** |  |

### 6.2 Backend

| Área | Arquivos de produção testados | Casos | Comportamentos validados |
|---|---|---:|---|
| Schemas e utils | Schemas Zod, `AppError.js`, `asyncHandler.js` | 46 | Validação, coerção, mensagens, erros e handlers assíncronos |
| Middlewares | Auth, admin, validação, upload e erros | 21 | JWT, autorização, status HTTP, Multer e `next` |
| Services | Auth, produto, pedido, usuário e storage | 59 | Regras de negócio, conflitos, estoque, transação e falhas externas |
| Controllers | About, auth, pedido, produto e usuário | 62 | Status, corpo JSON, parâmetros, usuário autenticado e encaminhamento de erros |
| Config | Prisma e Supabase | 7 | Instanciação, singleton, opções, configuração presente e ausente |
| **Total backend** |  | **195** |  |

## 7. Casos de teste importantes

### 7.1 Frontend

- **Formatação de preço:** números, strings, arredondamento, milhares, valores negativos e entradas inválidas.
- **Erros da API:** prioridade para issues do backend, mensagem `error`, falha de rede e fallback.
- **Autenticação:** restauração de token, login de cliente/admin, registro, logout e falhas.
- **Carrinho:** inclusão, incremento, remoção, alteração de quantidade, limpeza e cálculo dos totais.
- **Services:** URL, método HTTP, parâmetros, multipart e propagação de erro sem rede real.
- **Interface:** estados vazios, loading, sucesso, erro, navegação e restrição administrativa.
- **Checkout:** usuário ausente, carrinho vazio, métodos de pagamento, pedido aprovado e erro de estoque.
- **Edição administrativa:** validações, JSON, FormData, seleção de imagem, 404 e recuperação após erro.

### 7.2 Backend

- **Validação Zod:** cadastro, login, produtos, pedidos, perfil e alteração de senha.
- **Autenticação e autorização:** JWT válido/inválido, ausência de token e permissão administrativa.
- **Estoque e pedidos:** produto inexistente, estoque insuficiente, itens repetidos, total e decremento.
- **Services:** sucesso, conflito, não encontrado, falhas de bcrypt/JWT, Prisma e Storage.
- **Controllers:** status 200/201, validação de IDs, corpo JSON e erros enviados ao middleware.
- **Prisma:** criação do client e reutilização do singleton, sem conexão real.
- **Supabase:** URL/chave fictícias, opções do client e configuração ausente.

## 8. Defeitos encontrados

As severidades representam impacto técnico provável e não substituem priorização de produto.

### 8.1 Frontend

| Severidade | Problema | Justificativa |
|---|---|---|
| Alta | `HomeScreen` usa `name`, `price` e `image`, enquanto `ProductCard` espera `nome`, `precoAtual` e `imagens`. | Pode quebrar a exibição de nome, preço e imagem do catálogo principal. |
| Alta | `EditProductScreen` pode remover o sinal negativo e transformar preço negativo em positivo. | Permite persistir um valor diferente do digitado e compromete integridade comercial. |
| Média | Estoque usa `parseInt`, aceitando entradas como `1.5` ou `3abc` como valores truncados. | A validação aceita dados que não representam um inteiro válido conforme a interface informa. |
| Alta | `AddProductScreen` funciona como listagem e navega novamente para `AdicionarProduto`. | O fluxo de criação administrativa não corresponde ao nome/rota e pode impedir cadastro real. |
| Alta | `RegisterScreen` possui ação estática que navega sem executar cadastro real. | Pode levar o usuário a acreditar que uma conta foi criada sem persistência. |
| Média | `ProfileScreen` e `ChangePasswordScreen` possuem dados ou ações estáticas. | Funcionalidades sensíveis aparentam sucesso sem integração efetiva. |
| Média | Botões “Comprar” em novidades e “Rastrear” em pedidos não possuem callbacks. | Elementos interativos visíveis não executam a ação prometida. |
| Baixa | Permanecem ramos não cobertos para imagens ausentes, estados transitórios e desmontagem durante loading. | São lacunas de teste em cenários secundários; a meta global foi atingida. |

Não foi identificado defeito de severidade crítica nesta etapa.

### 8.2 Backend

| Severidade | Problema | Justificativa |
|---|---|---|
| Média | `storage.removerImagensPorUrl` propaga erro apesar de estar descrito como best-effort. | Contrato documentado e comportamento real divergem, podendo falhar operações de limpeza. |
| Média | `product.atualizar` pode deixar imagens órfãs quando o upload funciona e o Prisma falha. | Gera resíduos no Storage e custo operacional ao longo do tempo. |
| Baixa | `user.atualizarPerfil` não converte usuário inexistente em resposta de domínio 404. | O cliente pode receber erro genérico em vez de resposta consistente. |
| Alta | Operações de consultar estoque e depois alterar podem sofrer concorrência. | Compras simultâneas podem validar o mesmo saldo e causar venda acima do estoque disponível. |
| Média | `asyncHandler` encaminha rejeições assíncronas, mas não captura exceções síncronas do handler. | Uma exceção síncrona pode escapar do fluxo central de tratamento esperado. |

## 9. Limitações

- Não foram implementados testes de integração HTTP.
- Não foram implementados testes E2E.
- Não foi utilizado banco de dados exclusivo para testes.
- Não houve comunicação real entre frontend e backend.
- Não houve acesso real ao Supabase.
- Não houve validação em dispositivo físico.
- Não foram executadas matrizes específicas para Android, iOS e web.
- Mocks reduzem o realismo, embora sejam apropriados para isolamento unitário.
- Cobertura elevada demonstra execução do código, mas não garante ausência de defeitos.
- A suíte frontend apresentou aviso não bloqueante de atualização assíncrona do `VirtualizedList`.

## 10. Justificativa para não executar integração

O escopo acadêmico e o prazo favoreceram o fortalecimento da base da pirâmide de testes. Testes unitários oferecem retorno rápido e permitem validar regras de negócio sem risco sobre dados compartilhados.

Não havia banco PostgreSQL/Supabase exclusivamente destinado aos testes. Usar infraestrutura real poderia alterar dados, gerar arquivos no Storage ou tornar a suíte instável. Por segurança, todas as integrações foram simuladas.

Testes com Supertest nas rotas Express continuam recomendados, mas **não foram implementados** neste trabalho.

## 11. Próximos passos

1. Adicionar testes HTTP com Supertest para rotas e composição do Express.
2. Criar banco e projeto Supabase exclusivos para testes.
3. Implementar testes de integração entre frontend e API.
4. Adicionar E2E para cadastro, login, compra e administração.
5. Executar testes específicos em Android, iOS e web.
6. Corrigir e retestar os defeitos documentados.
7. Configurar CI para executar Jest e publicar cobertura automaticamente.
8. Tratar o aviso assíncrono do `VirtualizedList`.
9. Definir thresholds de cobertura no Jest para impedir regressão das métricas.

## 12. Roteiro resumido de apresentação — aproximadamente 5 minutos

1. **Objetivo:** explicar a criação de uma base automatizada e a meta mínima de 85%.
2. **Estratégia:** apresentar a pirâmide, o foco unitário e o padrão AAA.
3. **Ferramentas:** Jest, jest-expo, React Native Testing Library e mocks.
4. **Resultados:** mostrar 314 testes aprovados e as métricas de cobertura.
5. **Demonstração:** executar ou apresentar um teste de checkout, estoque ou autenticação.
6. **Defeitos:** destacar incompatibilidade do `HomeScreen`, validação de preço e concorrência de estoque.
7. **Limitações:** esclarecer ausência de integração, E2E, banco e dispositivo real.
8. **Próximos passos:** Supertest, infraestrutura exclusiva, E2E e CI.

## 13. Perguntas prováveis

### Por que usar mocks?

Para isolar a unidade testada, controlar respostas e impedir acesso a rede, banco, Supabase ou dispositivo real. Isso torna os testes rápidos e determinísticos.

### Por que não foram feitos testes de integração?

O escopo priorizou a base da pirâmide e não havia infraestrutura exclusiva segura. Integração com Supertest e banco dedicado permanece como próximo passo.

### Cobertura de 100% significa ausência de bugs?

Não. Significa que o código instrumentado foi executado pelos testes. Requisitos incorretos, integrações reais e cenários não previstos ainda podem conter defeitos.

### Qual a diferença entre teste unitário e teste de integração?

O unitário valida um módulo isolado com dependências simuladas. O de integração valida a comunicação real entre módulos, rotas, banco ou serviços.

### Por que a cobertura de branches é menor?

Porque condicionais, fallbacks e estados transitórios geram caminhos alternativos. Alguns são raros ou dependem de temporização e desmontagem de componentes.

### Por que não usar banco real?

Para evitar alteração de dados compartilhados, dependência de rede, flutuação de resultados e risco de executar testes destrutivos fora de ambiente controlado.

---

**Conclusão:** a base unitária atual atingiu a meta acadêmica no frontend e cobriu integralmente as camadas unitárias configuradas do backend. As limitações de integração foram explicitadas, e os defeitos encontrados foram documentados sem alteração do código de produção.
