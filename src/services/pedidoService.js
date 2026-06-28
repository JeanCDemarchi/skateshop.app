// Service de pedidos. Usa o axios central (o token é injetado pelo interceptor).
import api from './api';

// Lista os pedidos do usuário logado (rota protegida).
export async function listarPedidos() {
  const { data } = await api.get('/orders');
  return data;
}

// Detalhe de um pedido do usuário logado.
export async function obterPedido(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export default { listarPedidos, obterPedido };
