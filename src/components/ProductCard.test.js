import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import ProductCard from './ProductCard';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('../services/produtoService', () => ({
  imagemPrincipal: jest.fn(() => 'https://imagem.ficticia/shape.png'),
}));

test('renderiza produto e abre detalhes', async () => {
  const navigation = { navigate: jest.fn() };
  useNavigation.mockReturnValue(navigation);
  const item = { id: 1, nome: 'Shape', precoAtual: 123.5, imagens: [] };
  const tela = await render(<ProductCard item={item} />);
  expect(tela.getByText('Shape')).toBeTruthy();
  expect(tela.getByText('R$ 123,50')).toBeTruthy();
  await fireEvent.press(tela.getByText('Comprar'));
  expect(navigation.navigate).toHaveBeenCalledWith('DetalheProduto', { id: 1 });
});
