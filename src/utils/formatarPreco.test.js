import formatarPreco, { formatarPreco as nomeada } from './formatarPreco';

describe('formatarPreco', () => {
  test('exporta a mesma função como default e nomeada', () => {
    expect(formatarPreco).toBe(nomeada);
  });

  test.each([
    [1234.5, '1.234,50'],
    ['9.9', '9,90'],
    [0, '0,00'],
    [-1234.567, '-1.234,57'],
    [9999999.999, '10.000.000,00'],
  ])('formata %p no padrão brasileiro', (valor, esperado) => {
    expect(formatarPreco(valor)).toBe(esperado);
  });

  test.each([undefined, 'abc', NaN, Infinity, -Infinity])(
    'retorna zero para valor não finito %p',
    (valor) => {
      expect(formatarPreco(valor)).toBe('0,00');
    }
  );

  test('Number converte null e string vazia em zero', () => {
    expect(formatarPreco(null)).toBe('0,00');
    expect(formatarPreco('')).toBe('0,00');
  });
});
