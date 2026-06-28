// Cliente HTTP centralizado da aplicação.
// A URL base vem da variável de ambiente EXPO_PUBLIC_API_URL (definida no .env).
// Use o IP local do PC, NÃO "localhost" (o app roda no celular via Expo Go).
import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  timeout: 10000, // 10s
});

// --- Token de autenticação ---
// Guardado em memória. Na próxima etapa, o AuthContext vai chamar
// setAuthToken(token) após o login e setAuthToken(null) no logout.
let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

// Interceptor de request: injeta "Authorization: Bearer <token>" quando houver.
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Teste de conexão com o backend: GET /health deve retornar { status: "ok" }.
export async function pingApi() {
  const response = await api.get('/health');
  return response.data;
}

export default api;
