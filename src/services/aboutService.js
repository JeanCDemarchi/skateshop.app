// Service da página "Sobre". Usa o axios central.
import api from './api';

export async function obterSobre() {
  const { data } = await api.get('/about');
  return data;
}

export default { obterSobre };
