import React from 'react';
import { act, renderHook } from '@testing-library/react-native';

import { CartProvider, useCart } from './CartContext';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
const shape = { id: 1, nome: 'Shape', precoAtual: 100 };
const truck = { id: 2, nome: 'Truck', precoAtual: 50 };

describe('CartContext', () => {
  test('useCart exige CartProvider', async () => {
    await expect(renderHook(() => useCart())).rejects.toThrow(
      'useCart deve ser usado dentro de <CartProvider>'
    );
  });

  test('inicia vazio e com totais zerados', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });
    expect(result.current.itens).toEqual([]);
    expect(result.current.totalItens).toBe(0);
    expect(result.current.valorTotal).toBe(0);
  });

  test('adiciona produto com quantidade padrão', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });
    await act(() => result.current.adicionarAoCarrinho(shape));
    expect(result.current.itens).toEqual([{ produto: shape, quantidade: 1 }]);
    expect(result.current.totalItens).toBe(1);
    expect(result.current.valorTotal).toBe(100);
  });

  test('incrementa produto existente e preserva os demais', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });
    await act(() => {
      result.current.adicionarAoCarrinho(shape, 2);
      result.current.adicionarAoCarrinho(truck, 1);
    });
    await act(() => result.current.adicionarAoCarrinho(shape, 3));
    expect(result.current.itens).toEqual([
      { produto: shape, quantidade: 5 },
      { produto: truck, quantidade: 1 },
    ]);
    expect(result.current.totalItens).toBe(6);
    expect(result.current.valorTotal).toBe(550);
  });

  test('remove somente o produto informado', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });
    await act(() => {
      result.current.adicionarAoCarrinho(shape);
      result.current.adicionarAoCarrinho(truck);
    });
    await act(() => result.current.removerDoCarrinho(shape.id));
    expect(result.current.itens).toEqual([{ produto: truck, quantidade: 1 }]);
  });

  test('altera quantidade e preserva produtos não correspondentes', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });
    await act(() => {
      result.current.adicionarAoCarrinho(shape);
      result.current.adicionarAoCarrinho(truck);
    });
    await act(() => result.current.alterarQuantidade(shape.id, 4));
    expect(result.current.itens).toEqual([
      { produto: shape, quantidade: 4 },
      { produto: truck, quantidade: 1 },
    ]);
  });

  test.each([0, -1])('remove produto ao alterar quantidade para %p', async (quantidade) => {
    const { result } = await renderHook(() => useCart(), { wrapper });
    await act(() => result.current.adicionarAoCarrinho(shape));
    await act(() => result.current.alterarQuantidade(shape.id, quantidade));
    expect(result.current.itens).toEqual([]);
  });

  test('limpa todos os itens', async () => {
    const { result } = await renderHook(() => useCart(), { wrapper });
    await act(() => {
      result.current.adicionarAoCarrinho(shape);
      result.current.adicionarAoCarrinho(truck);
    });
    await act(() => result.current.limparCarrinho());
    expect(result.current.itens).toEqual([]);
    expect(result.current.totalItens).toBe(0);
    expect(result.current.valorTotal).toBe(0);
  });
});
