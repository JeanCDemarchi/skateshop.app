import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';

jest.mock('../context/CartContext', () => ({ useCart: jest.fn() }));
jest.mock('../services/produtoService', () => ({
  imagemPrincipal: jest.fn(() => 'https://imagem.ficticia/shape.png'),
}));

test('renderiza produto e adiciona ao carrinho', async () => {
  const adicionarAoCarrinho = jest.fn();
  useCart.mockReturnValue({ adicionarAoCarrinho });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const item = { id: 1, nome: 'Shape', precoAtual: 123.5, imagens: [] };
  const tela = await render(<ProductCard item={item} />);
  expect(tela.getByText('Shape')).toBeTruthy();
  expect(tela.getByText('R$ 123,50')).toBeTruthy();
  await fireEvent.press(tela.getByText('Comprar'));
  expect(adicionarAoCarrinho).toHaveBeenCalledWith(item, 1);
  expect(Alert.alert).toHaveBeenCalledWith(
    'Carrinho',
    '"Shape" foi adicionado ao carrinho.'
  );
});
