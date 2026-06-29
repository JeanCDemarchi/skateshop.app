import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import * as produtos from '../services/produtoService';
import * as userService from '../services/userService';

import ContactScreen from './ContactScreen';
import ProductDetailScreen from './ProductDetailScreen';
import ProfileScreen from './ProfileScreen';
import SearchScreen from './SearchScreen';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }) => <Text>{name}</Text> };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  DrawerActions: { openDrawer: jest.fn(() => ({ type: 'OPEN_DRAWER' })) },
}));

jest.mock('../components/HeaderMenu', () => {
  const { Text } = require('react-native');
  return () => <Text>HeaderMenu</Text>;
});

jest.mock('../components/BottomMenu', () => {
  const { Text } = require('react-native');
  return () => <Text>BottomMenu</Text>;
});

jest.mock('../components/ProductCard', () => {
  const { Text } = require('react-native');
  return ({ item }) => <Text>Produto:{item.nome}</Text>;
});

jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../context/CartContext', () => ({ useCart: jest.fn() }));

jest.mock('../services/produtoService', () => ({
  buscarProdutos: jest.fn(),
  imagemPrincipal: jest.fn((produto) => produto?.imagens?.[0]?.url || null),
  obterProduto: jest.fn(),
}));

jest.mock('../services/userService', () => ({
  obterPerfil: jest.fn(),
  atualizarPerfil: jest.fn(),
}));

const navigation = {
  dispatch: jest.fn(),
  getParent: jest.fn(),
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const produto = {
  id: 10,
  nome: 'Shape Maple',
  descricao: 'Shape importado',
  precoAtual: 249.9,
  imagens: [
    { id: 'a', url: 'https://img.test/a.png', principal: true },
    { id: 'b', url: 'https://img.test/b.png' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  useNavigation.mockReturnValue(navigation);
  useAuth.mockReturnValue({
    usuario: { id: 7, nome: 'Ana', email: 'ana@email.com', endereco: 'Rua A' },
    atualizarUsuario: jest.fn(),
  });
  useCart.mockReturnValue({ adicionarAoCarrinho: jest.fn() });
  userService.obterPerfil.mockResolvedValue({
    id: 7,
    nome: 'Ana',
    email: 'ana@email.com',
    endereco: 'Rua A',
  });
});

test('ProductDetailScreen carrega produto, troca imagem e adiciona ao carrinho', async () => {
  const adicionarAoCarrinho = jest.fn();
  useCart.mockReturnValue({ adicionarAoCarrinho });
  produtos.obterProduto.mockResolvedValue(produto);

  const tela = await render(
    <ProductDetailScreen route={{ params: { id: 10 } }} navigation={navigation} />
  );

  await waitFor(() => expect(tela.getByText('Shape Maple')).toBeTruthy());
  expect(tela.getByText('R$ 249,90')).toBeTruthy();
  await fireEvent.press(tela.getByText('arrow-back'));
  await fireEvent.press(tela.getByText('Adicionar ao carrinho'));

  expect(navigation.goBack).toHaveBeenCalled();
  expect(adicionarAoCarrinho).toHaveBeenCalledWith(produto, 1);
  expect(Alert.alert).toHaveBeenCalledWith(
    'Carrinho',
    '"Shape Maple" foi adicionado ao carrinho.'
  );
});

test('ProductDetailScreen mostra erro quando produto não existe', async () => {
  produtos.obterProduto.mockRejectedValue({ response: { status: 404 } });

  const tela = await render(
    <ProductDetailScreen route={{ params: { id: 999 } }} navigation={navigation} />
  );

  await waitFor(() => expect(tela.getByText('Produto não encontrado.')).toBeTruthy());
});

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('busca produtos com debounce e renderiza resultados', async () => {
    produtos.buscarProdutos.mockResolvedValue([{ id: 1, nome: 'Truck Silver' }]);
    const tela = await render(<SearchScreen navigation={navigation} />);

    expect(tela.getByText('Digite para buscar produtos.')).toBeTruthy();
    await fireEvent.changeText(tela.getByPlaceholderText('Buscar produtos...'), 'truck');

    await act(async () => {
      jest.advanceTimersByTime(350);
      await Promise.resolve();
    });

    await waitFor(() => expect(produtos.buscarProdutos).toHaveBeenCalledWith('truck'));
    expect(tela.getByText('Produto:Truck Silver')).toBeTruthy();
    await fireEvent.press(tela.getByText('arrow-back'));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  test('exibe estado vazio quando busca falha', async () => {
    produtos.buscarProdutos.mockRejectedValue(new Error('rede'));
    const tela = await render(<SearchScreen navigation={navigation} />);

    await fireEvent.changeText(tela.getByPlaceholderText('Buscar produtos...'), 'shape');
    await act(async () => {
      jest.advanceTimersByTime(350);
      await Promise.resolve();
    });

    await waitFor(() => expect(tela.getByText('Nenhum produto encontrado.')).toBeTruthy());
  });
});

test('ContactScreen valida e envia mensagem', async () => {
  const tela = await render(<ContactScreen navigation={navigation} />);

  await fireEvent.press(tela.getByText('Enviar'));
  expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Preencha todos os campos.');

  await fireEvent.changeText(tela.getByPlaceholderText('Nome'), 'Ana');
  await fireEvent.changeText(tela.getByPlaceholderText('E-mail'), 'email-invalido');
  await fireEvent.changeText(tela.getByPlaceholderText('Mensagem'), 'Oi');
  await fireEvent.press(tela.getByText('Enviar'));
  expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Informe um e-mail válido.');

  await fireEvent.changeText(tela.getByPlaceholderText('E-mail'), 'ana@email.com');
  await fireEvent.press(tela.getByText('Enviar'));
  expect(Alert.alert).toHaveBeenCalledWith(
    'Mensagem enviada',
    'Obrigado pelo contato! Responderemos em breve.'
  );
});

test('ProfileScreen salva alterações e faz logout pelo parent navigator', async () => {
  const parent = { reset: jest.fn() };
  const atualizarUsuario = jest.fn();
  navigation.getParent.mockReturnValue(parent);
  useAuth.mockReturnValue({
    usuario: { id: 7, nome: 'Ana', email: 'ana@email.com', endereco: 'Rua A' },
    atualizarUsuario,
  });
  userService.atualizarPerfil.mockResolvedValue({
    id: 7,
    nome: 'Ana Nova',
    email: 'ana@email.com',
    endereco: 'Rua B',
  });

  const tela = await render(<ProfileScreen />);
  await waitFor(() => expect(userService.obterPerfil).toHaveBeenCalled());
  await fireEvent.changeText(tela.getByDisplayValue('Ana'), 'Ana Nova');
  await fireEvent.changeText(tela.getByDisplayValue('Rua A'), 'Rua B');
  await fireEvent.press(tela.getByText('Salvar alterações'));

  await waitFor(() =>
    expect(userService.atualizarPerfil).toHaveBeenCalledWith({
      nome: 'Ana Nova',
      endereco: 'Rua B',
    })
  );
  expect(atualizarUsuario).toHaveBeenCalledWith(
    expect.objectContaining({ nome: 'Ana Nova' })
  );
  expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Perfil atualizado com sucesso.');

  await fireEvent.press(tela.getByText('menu'));
  await fireEvent.press(tela.getByText('Sair'));
  expect(DrawerActions.openDrawer).toHaveBeenCalled();
  expect(parent.reset).toHaveBeenCalledWith({
    index: 0,
    routes: [{ name: 'Login' }],
  });
});
