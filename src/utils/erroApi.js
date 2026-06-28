// Extrai uma mensagem amigável a partir de um erro do axios/backend.
export function extrairMensagemErro(err, fallback) {
  const data = err?.response?.data;
  if (data?.issues?.length) {
    return data.issues.map((i) => i.mensagem).join('\n');
  }
  if (data?.error) {
    return data.error;
  }
  if (err?.message === 'Network Error') {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  }
  return fallback || 'Algo deu errado. Tente novamente.';
}

export default extrairMensagemErro;
