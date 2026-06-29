const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('./api', () => ({
  __esModule: true,
  default: mockApi,
}));

const service = require('./produtoService');

describe('produtoService', () => {
  test.each([
    ['listarProdutos', 'get', ['/products']],
    ['listarDestaques', 'get', ['/products', { params: { destaque: true } }]],
    ['buscarProdutos', 'get', ['/products/search', { params: { q: 'shape' } }]],
    ['obterProduto', 'get', ['/products/7']],
    ['listarSugestoes', 'get', ['/products/suggestions']],
    ['excluirProduto', 'delete', ['/products/7']],
  ])('%s chama o endpoint esperado e retorna data', async (nome, metodo, args) => {
    mockApi[metodo].mockResolvedValue({ data: { origem: nome } });
    const parametros =
      nome === 'buscarProdutos' ? ['shape'] : ['obterProduto', 'excluirProduto'].includes(nome) ? [7] : [];
    await expect(service[nome](...parametros)).resolves.toEqual({ origem: nome });
    expect(mockApi[metodo]).toHaveBeenCalledWith(...args);
  });

  test('criarProduto envia FormData como multipart', async () => {
    const formData = { marcador: 'form-data-ficticio' };
    mockApi.post.mockResolvedValue({ data: { id: 1 } });
    await expect(service.criarProduto(formData)).resolves.toEqual({ id: 1 });
    expect(mockApi.post).toHaveBeenCalledWith('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  test.each([
    [false, undefined],
    [true, { headers: { 'Content-Type': 'multipart/form-data' } }],
  ])('atualizarProduto usa configuração multipart=%p', async (multipart, config) => {
    const payload = { nome: 'Shape' };
    mockApi.put.mockResolvedValue({ data: { id: 2 } });
    await expect(service.atualizarProduto(2, payload, multipart)).resolves.toEqual({
      id: 2,
    });
    expect(mockApi.put).toHaveBeenCalledWith('/products/2', payload, config);
  });

  test.each([
    [undefined, null],
    [{}, null],
    [{ imagens: [] }, null],
    [{ imagens: [{ url: 'primeira' }] }, 'primeira'],
    [
      {
        imagens: [
          { url: 'primeira', principal: false },
          { url: 'principal', principal: true },
        ],
      },
      'principal',
    ],
  ])('imagemPrincipal(%p) retorna %p', (produto, esperado) => {
    expect(service.imagemPrincipal(produto)).toBe(esperado);
  });

  test('propaga erros da API', async () => {
    const error = new Error('erro Axios fictício');
    mockApi.get.mockRejectedValue(error);
    await expect(service.listarProdutos()).rejects.toBe(error);
  });
});
