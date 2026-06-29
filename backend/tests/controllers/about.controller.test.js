const { obter } = require("../../src/controllers/about.controller");
const { criarResposta } = require("./helpers");

describe("about.controller", () => {
  test("responde 200 com o conteúdo institucional", () => {
    const res = criarResposta();
    obter({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      titulo: "Skateshop",
      descricao: expect.stringContaining("loja especializada em skate"),
      destaques: [
        "Produtos selecionados das melhores marcas",
        "Entrega para todo o Brasil",
        "Montagem e curadoria por skatistas",
        "Suporte e atendimento especializado",
      ],
    });
  });
});
