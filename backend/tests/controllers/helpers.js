function criarResposta() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

async function executar(controller, req = {}) {
  const res = criarResposta();
  const next = jest.fn();
  await controller(req, res, next);
  return { res, next };
}

module.exports = { criarResposta, executar };
