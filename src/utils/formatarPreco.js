// Formata um número (ex: 1234.5) para o padrão brasileiro de preço (1.234,50).
// Não usa Intl (suporte limitado no Hermes/React Native) — formatação manual.
export function formatarPreco(valor) {
  const numero = Number(valor);
  if (!isFinite(numero)) return '0,00';

  const [inteiro, decimal] = numero.toFixed(2).split('.');
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${comMilhar},${decimal}`;
}

export default formatarPreco;
