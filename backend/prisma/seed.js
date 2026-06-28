// Seed do banco — popula dados de teste.
// Rode com: npx prisma db seed
//
// É idempotente: limpa as tabelas relevantes antes de inserir, então pode
// ser executado várias vezes sem duplicar dados.
require("dotenv/config");
const bcrypt = require("bcryptjs");

const prisma = require("../src/config/prisma");

const PLACEHOLDER = (texto) =>
  `https://placehold.co/600x400?text=${encodeURIComponent(texto)}`;

const produtos = [
  {
    nome: "Shape Maple 8.0",
    descricao: "Shape profissional de bordo canadense (maple), 8.0 polegadas.",
    precoAtual: 299.9,
    estoqueAtual: 20,
    destaque: true,
  },
  {
    nome: "Shape Iniciante 7.75",
    descricao: "Shape ideal para iniciantes, leve e resistente, 7.75 polegadas.",
    precoAtual: 199.9,
    estoqueAtual: 35,
    destaque: false,
  },
  {
    nome: "Truck Parallel 139mm",
    descricao: "Par de trucks de alta durabilidade, ideal para manobras técnicas.",
    precoAtual: 249.0,
    estoqueAtual: 15,
    destaque: true,
  },
  {
    nome: "Roda 52mm 99A",
    descricao: "Jogo de 4 rodas 52mm dureza 99A, ótimas para street.",
    precoAtual: 159.9,
    estoqueAtual: 40,
    destaque: false,
  },
  {
    nome: "Rolamento Abec 7",
    descricao: "Jogo de 8 rolamentos Abec 7, giro suave e veloz.",
    precoAtual: 89.9,
    estoqueAtual: 50,
    destaque: true,
  },
  {
    nome: "Lixa Emborrachada",
    descricao: "Lixa antiderrapante de alta aderência para o shape.",
    precoAtual: 39.9,
    estoqueAtual: 60,
    destaque: false,
  },
  {
    nome: "Kit Parafusos 1 polegada",
    descricao: "Kit com 8 parafusos allen de 1 polegada para montagem.",
    precoAtual: 24.9,
    estoqueAtual: 80,
    destaque: false,
  },
  {
    nome: "Skate Montado Completo",
    descricao: "Skate montado pronto para andar: shape, trucks, rodas e rolamentos.",
    precoAtual: 599.9,
    estoqueAtual: 10,
    destaque: true,
  },
];

async function main() {
  // Limpeza respeitando as dependências (filhos antes dos pais).
  await prisma.itemPedido.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.envio.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.produtoImagem.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.usuario.deleteMany();

  // Usuário de teste (senha sempre com hash).
  const senhaHash = await bcrypt.hash("123456", 10);
  const usuario = await prisma.usuario.create({
    data: {
      username: "admin",
      nome: "Administrador Skateshop",
      email: "admin@skateshop.com",
      senha: senhaHash,
      endereco: "Rua dos Skatistas, 100",
      cep: "01001-000",
      role: "admin",
    },
  });

  // Produtos com 1-2 imagens cada (a primeira é a principal).
  for (const p of produtos) {
    await prisma.produto.create({
      data: {
        nome: p.nome,
        descricao: p.descricao,
        precoAtual: p.precoAtual,
        estoqueAtual: p.estoqueAtual,
        destaque: p.destaque,
        fkIdCriador: usuario.id,
        imagens: {
          create: [
            { url: PLACEHOLDER(p.nome), principal: true },
            { url: PLACEHOLDER(`${p.nome} - 2`), principal: false },
          ],
        },
      },
    });
  }

  console.log(
    `Seed concluído: 1 usuário (login: admin / senha: 123456) e ${produtos.length} produtos.`
  );
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
