// Controller da página "Sobre" (RF08). Conteúdo estático.
const SOBRE = {
  titulo: "Skateshop",
  descricao:
    "A Skateshop é uma loja especializada em skate, nascida da paixão pela " +
    "cultura do skate. Trabalhamos com shapes, trucks, rodas, rolamentos e " +
    "acessórios das melhores marcas, com curadoria feita por quem anda de " +
    "skate de verdade. Nosso objetivo é oferecer produtos de qualidade, preço " +
    "justo e um atendimento que entende as necessidades do skatista.",
  destaques: [
    "Produtos selecionados das melhores marcas",
    "Entrega para todo o Brasil",
    "Montagem e curadoria por skatistas",
    "Suporte e atendimento especializado",
  ],
};

function obter(req, res) {
  res.status(200).json(SOBRE);
}

module.exports = { obter };
