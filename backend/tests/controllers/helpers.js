function criarResposta() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

async function executar(handler, req = {}) {
  const res = criarResposta();
  const next = jest.fn();

  await handler(req, res, next);

  return { req, res, next };
}

module.exports = { criarResposta, executar };
