import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { AuthProvider, useAuth } from './AuthContext';
import api, { setAuthToken } from '../services/api';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
  setAuthToken: jest.fn(),
}));

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

async function renderAuth() {
  const hook = await renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(hook.result.current.carregando).toBe(false));
  return hook;
}

describe('AuthContext', () => {
  beforeEach(() => {
    SecureStore.getItemAsync.mockResolvedValue(null);
    SecureStore.setItemAsync.mockResolvedValue();
    SecureStore.deleteItemAsync.mockResolvedValue();
  });

  test('useAuth exige AuthProvider', async () => {
    await expect(renderHook(() => useAuth())).rejects.toThrow(
      'useAuth deve ser usado dentro de <AuthProvider>'
    );
  });

  test('inicia sem sessão quando não há token salvo', async () => {
    const { result } = await renderAuth();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('skateshop_token');
    expect(result.current).toMatchObject({
      usuario: null,
      token: null,
      carregando: false,
    });
    expect(api.get).not.toHaveBeenCalled();
  });

  test('restaura token salvo e carrega usuário atualizado', async () => {
    SecureStore.getItemAsync.mockResolvedValue('token-salvo-ficticio');
    api.get.mockResolvedValue({ data: { id: 7, nome: 'Ana' } });
    const { result } = await renderAuth();
    expect(setAuthToken).toHaveBeenCalledWith('token-salvo-ficticio');
    expect(api.get).toHaveBeenCalledWith('/users/me');
    expect(result.current.token).toBe('token-salvo-ficticio');
    expect(result.current.usuario).toEqual({ id: 7, nome: 'Ana' });
  });

  test('limpa sessão quando a restauração falha', async () => {
    SecureStore.getItemAsync.mockResolvedValue('token-invalido-ficticio');
    api.get.mockRejectedValue(new Error('token inválido'));
    const { result } = await renderAuth();
    expect(setAuthToken).toHaveBeenLastCalledWith(null);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('skateshop_token');
    expect(result.current).toMatchObject({ usuario: null, token: null });
  });

  test('ignora falha ao apagar token durante recuperação', async () => {
    SecureStore.getItemAsync.mockRejectedValue(new Error('leitura simulada'));
    SecureStore.deleteItemAsync.mockRejectedValue(new Error('remoção simulada'));
    const { result } = await renderAuth();
    expect(result.current.carregando).toBe(false);
  });

  test('login persiste sessão e devolve usuário', async () => {
    const { result } = await renderAuth();
    const usuario = { id: 1, username: 'ana' };
    api.post.mockResolvedValue({
      data: { token: 'token-login-ficticio', usuario },
    });
    let retorno;
    await act(async () => {
      retorno = await result.current.login('ana', 'segredo');
    });
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      username: 'ana',
      senha: 'segredo',
    });
    expect(setAuthToken).toHaveBeenCalledWith('token-login-ficticio');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'skateshop_token',
      'token-login-ficticio'
    );
    expect(retorno).toBe(usuario);
    expect(result.current).toMatchObject({
      usuario,
      token: 'token-login-ficticio',
    });
  });

  test.each([
    [
      { response: { data: { issues: [{ mensagem: 'Campo A' }, { mensagem: 'Campo B' }] } } },
      'Campo A\nCampo B',
    ],
    [{ response: { data: { error: 'Credenciais inválidas' } } }, 'Credenciais inválidas'],
    [
      { message: 'Network Error' },
      'Não foi possível conectar ao servidor. Verifique sua conexão e o IP da API.',
    ],
    [new Error('desconhecido'), 'Não foi possível entrar.'],
  ])('login traduz falha para mensagem amigável', async (erro, mensagem) => {
    const { result } = await renderAuth();
    api.post.mockRejectedValue(erro);
    await expect(result.current.login('ana', 'x')).rejects.toThrow(mensagem);
  });

  test('register envia dados e devolve resposta', async () => {
    const { result } = await renderAuth();
    const dados = { username: 'ana' };
    const usuario = { id: 1, username: 'ana' };
    api.post.mockResolvedValue({ data: usuario });
    await expect(result.current.register(dados)).resolves.toBe(usuario);
    expect(api.post).toHaveBeenCalledWith('/auth/register', dados);
  });

  test('register usa fallback próprio em erro desconhecido', async () => {
    const { result } = await renderAuth();
    api.post.mockRejectedValue(new Error('desconhecido'));
    await expect(result.current.register({})).rejects.toThrow(
      'Não foi possível criar a conta.'
    );
  });

  test('logout limpa memória e armazenamento', async () => {
    SecureStore.getItemAsync.mockResolvedValue('token-salvo-ficticio');
    api.get.mockResolvedValue({ data: { id: 1 } });
    const { result } = await renderAuth();
    await act(async () => {
      await result.current.logout();
    });
    expect(setAuthToken).toHaveBeenLastCalledWith(null);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('skateshop_token');
    expect(result.current).toMatchObject({ usuario: null, token: null });
  });

  test('logout ignora erro de remoção', async () => {
    const { result } = await renderAuth();
    SecureStore.deleteItemAsync.mockRejectedValue(new Error('remoção simulada'));
    await expect(
      act(async () => {
        await result.current.logout();
      })
    ).resolves.toBeUndefined();
  });

  test('atualizarUsuario mescla dados no usuário atual', async () => {
    SecureStore.getItemAsync.mockResolvedValue('token-salvo-ficticio');
    api.get.mockResolvedValue({ data: { id: 1, nome: 'Ana', email: 'a@a.com' } });
    const { result } = await renderAuth();
    await act(() => {
      result.current.atualizarUsuario({ nome: 'Ana Nova' });
    });
    expect(result.current.usuario).toEqual({
      id: 1,
      nome: 'Ana Nova',
      email: 'a@a.com',
    });
  });
});
