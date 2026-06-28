let mockCreateConfig;
let mockInterceptor;

const mockApi = {
  get: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn((interceptor) => {
        mockInterceptor = interceptor;
      }),
    },
  },
};

jest.mock('axios', () => ({
  create: jest.fn((config) => {
    mockCreateConfig = config;
    return mockApi;
  }),
}));

process.env.EXPO_PUBLIC_API_URL = 'https://api-ficticia.example.test';

const axios = require('axios');
const { api, pingApi, setAuthToken } = require('./api');

describe('api', () => {
  afterAll(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  test('cria cliente Axios com URL fictícia e timeout', () => {
    expect(mockCreateConfig).toEqual({
      baseURL: 'https://api-ficticia.example.test',
      timeout: 10000,
    });
    expect(api).toBe(mockApi);
  });

  test('registra interceptor de requisição', () => {
    expect(mockInterceptor).toEqual(expect.any(Function));
  });

  test('interceptor injeta Bearer token quando autenticado', () => {
    const config = { headers: {} };
    setAuthToken('token-ficticio');
    expect(mockInterceptor(config)).toBe(config);
    expect(config.headers.Authorization).toBe('Bearer token-ficticio');
    setAuthToken(null);
  });

  test('interceptor preserva config sem Authorization quando não há token', () => {
    const config = { headers: { Accept: 'application/json' } };
    setAuthToken(null);
    expect(mockInterceptor(config)).toEqual({
      headers: { Accept: 'application/json' },
    });
  });

  test('pingApi consulta health e devolve apenas data', async () => {
    mockApi.get.mockResolvedValue({ data: { status: 'ok' } });
    await expect(pingApi()).resolves.toEqual({ status: 'ok' });
    expect(mockApi.get).toHaveBeenCalledWith('/health');
  });

  test('pingApi propaga erro do Axios', async () => {
    const error = new Error('rede bloqueada pelo teste');
    mockApi.get.mockRejectedValue(error);
    await expect(pingApi()).rejects.toBe(error);
  });
});
