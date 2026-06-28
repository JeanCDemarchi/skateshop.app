// Service de produtos: encapsula as chamadas à API usando o axios central.
import api from './api';

// Lista todos os produtos (cada um com suas imagens).
export async function listarProdutos() {
  const { data } = await api.get('/products');
  return data;
}

// Lista apenas os produtos em destaque.
export async function listarDestaques() {
  const { data } = await api.get('/products', { params: { destaque: true } });
  return data;
}

// Busca por nome/descrição. Pode retornar lista vazia.
export async function buscarProdutos(termo) {
  const { data } = await api.get('/products/search', { params: { q: termo } });
  return data;
}

// Obtém um produto pelo id (com todas as imagens). Lança erro 404 se não existir.
export async function obterProduto(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

// Até 4 produtos sugeridos ("outros produtos") para o checkout.
export async function listarSugestoes() {
  const { data } = await api.get('/products/suggestions');
  return data;
}

// --- Operações de administrador (exigem role admin no backend) ---

// Cria um produto. Recebe um FormData (multipart) com campos + imagens.
export async function criarProduto(formData) {
  const { data } = await api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// Edita um produto. `payload` pode ser objeto (JSON) ou FormData (com imagens).
export async function atualizarProduto(id, payload, multipart = false) {
  const config = multipart
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined;
  const { data } = await api.put(`/products/${id}`, payload, config);
  return data;
}

// Exclui um produto. Backend retorna 409 se houver pedidos vinculados.
export async function excluirProduto(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

// Helper: URL da imagem principal de um produto (ou a primeira, ou null).
export function imagemPrincipal(produto) {
  const imagens = produto?.imagens || [];
  if (imagens.length === 0) return null;
  const principal = imagens.find((img) => img.principal);
  return (principal || imagens[0]).url;
}

export default {
  listarProdutos,
  listarDestaques,
  buscarProdutos,
  obterProduto,
  listarSugestoes,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  imagemPrincipal,
};
