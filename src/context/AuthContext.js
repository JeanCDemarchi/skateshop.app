// Contexto de autenticação: mantém usuario/token, persiste a sessão e expõe
// login/register/logout para as telas.
import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import api, { setAuthToken } from '../services/api';

const TOKEN_KEY = 'skateshop_token';

const AuthContext = createContext(null);

// Extrai uma mensagem amigável a partir do erro do axios/backend.
function extrairMensagemErro(err, fallback) {
  const data = err?.response?.data;
  if (data?.issues?.length) {
    return data.issues.map((i) => i.mensagem).join('\n');
  }
  if (data?.error) {
    return data.error;
  }
  if (err?.message === 'Network Error') {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e o IP da API.';
  }
  return fallback || 'Algo deu errado. Tente novamente.';
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true); // restaurando a sessão

  // Ao iniciar o app: tenta restaurar a sessão a partir do token salvo.
  useEffect(() => {
    (async () => {
      try {
        const salvo = await SecureStore.getItemAsync(TOKEN_KEY);
        if (salvo) {
          setAuthToken(salvo);
          setToken(salvo);
          // Valida o token e recupera os dados atualizados do usuário.
          const { data } = await api.get('/users/me');
          setUsuario(data);
        }
      } catch (err) {
        // Token inválido/expirado: limpa tudo.
        setAuthToken(null);
        setToken(null);
        setUsuario(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  async function login(username, senha) {
    try {
      const { data } = await api.post('/auth/login', { username, senha });
      setAuthToken(data.token);
      setToken(data.token);
      setUsuario(data.usuario);
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      return data.usuario;
    } catch (err) {
      throw new Error(extrairMensagemErro(err, 'Não foi possível entrar.'));
    }
  }

  async function register(dados) {
    try {
      const { data } = await api.post('/auth/register', dados);
      return data;
    } catch (err) {
      throw new Error(extrairMensagemErro(err, 'Não foi possível criar a conta.'));
    }
  }

  async function logout() {
    setAuthToken(null);
    setToken(null);
    setUsuario(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  }

  // Atualiza os dados do usuário em memória (ex.: após editar o perfil).
  function atualizarUsuario(novosDados) {
    setUsuario((atual) => ({ ...atual, ...novosDados }));
  }

  return (
    <AuthContext.Provider
      value={{ usuario, token, carregando, login, register, logout, atualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
