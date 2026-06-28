// Service do usuário logado (perfil e senha). Usa o axios central (token via interceptor).
import api from './api';

export async function obterPerfil() {
  const { data } = await api.get('/users/me');
  return data;
}

export async function atualizarPerfil(dados) {
  const { data } = await api.patch('/users/me', dados);
  return data;
}

export async function alterarSenha(dados) {
  const { data } = await api.patch('/users/me/password', dados);
  return data;
}

export default { obterPerfil, atualizarPerfil, alterarSenha };
