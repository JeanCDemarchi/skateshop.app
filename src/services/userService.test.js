const mockApi = {
  get: jest.fn(),
  patch: jest.fn(),
};

jest.mock('./api', () => ({
  __esModule: true,
  default: mockApi,
}));

const service = require('./userService');

describe('userService', () => {
  test('obterPerfil consulta o usuário atual', async () => {
    mockApi.get.mockResolvedValue({ data: { id: 1 } });
    await expect(service.obterPerfil()).resolves.toEqual({ id: 1 });
    expect(mockApi.get).toHaveBeenCalledWith('/users/me');
  });

  test('atualizarPerfil envia os dados', async () => {
    const dados = { nome: 'Ana' };
    mockApi.patch.mockResolvedValue({ data: { id: 1, ...dados } });
    await expect(service.atualizarPerfil(dados)).resolves.toEqual({
      id: 1,
      nome: 'Ana',
    });
    expect(mockApi.patch).toHaveBeenCalledWith('/users/me', dados);
  });

  test('alterarSenha envia os dados para o endpoint específico', async () => {
    const dados = { senhaAtual: 'a', novaSenha: 'b' };
    mockApi.patch.mockResolvedValue({ data: { message: 'ok' } });
    await expect(service.alterarSenha(dados)).resolves.toEqual({ message: 'ok' });
    expect(mockApi.patch).toHaveBeenCalledWith('/users/me/password', dados);
  });

  test('propaga erros da API', async () => {
    const error = new Error('erro Axios fictício');
    mockApi.patch.mockRejectedValue(error);
    await expect(service.atualizarPerfil({})).rejects.toBe(error);
  });
});
