import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as aboutService from '../services/aboutService';
import * as produtos from '../services/produtoService';
import * as userService from '../services/userService';

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ProfileScreen from './ProfileScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import HomeScreen from './HomeScreen';
import NewsScreen from './NewsScreen';
import ContactScreen from './ContactScreen';
import AboutScreen from './AboutScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  DrawerActions: { openDrawer: jest.fn(() => ({ type: 'OPEN_DRAWER' })) },
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }) => <Text>{name}</Text> };
});
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../services/aboutService', () => ({ obterSobre: jest.fn() }));
jest.mock('../services/produtoService', () => ({
  listarProdutos: jest.fn(),
  imagemPrincipal: jest.fn(() => 'https://imagem.ficticia/produto.png'),
}));
jest.mock('../services/userService', () => ({
  obterPerfil: jest.fn(),
  atualizarPerfil: jest.fn(),
  alterarSenha: jest.fn(),
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
  return ({ item }) => <Text>Produto:{item.nome || item.name || item.id}</Text>;
});

const navigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  getParent: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  useNavigation.mockReturnValue(navigation);
  useAuth.mockReturnValue({
    usuario: { id: 7, nome: 'Ana', email: 'ana@email.com', endereco: 'Rua A' },
    atualizarUsuario: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  produtos.listarProdutos.mockResolvedValue([]);
  aboutService.obterSobre.mockRejectedValue(new Error('sem api'));
  userService.obterPerfil.mockResolvedValue({
    id: 7,
    nome: 'Ana',
    email: 'ana@email.com',
    endereco: 'Rua A',
  });
});

describe('LoginScreen', () => {
  test('valida campos vazios e abre cadastro', async () => {
    useAuth.mockReturnValue({ login: jest.fn() });
    const tela = await render(<LoginScreen navigation={navigation} />);
    await fireEvent.press(tela.getByText('Entrar'));
    expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Preencha usuário e senha.');
    await fireEvent.press(tela.getByText(/Cadastre-se aqui/));
    expect(navigation.navigate).toHaveBeenCalledWith('Cadastro');
  });

  test.each([
    ['cliente', 'App'],
    ['admin', 'AdminHome'],
  ])('autentica %s e redefine navegação', async (role, destino) => {
    const login = jest.fn().mockResolvedValue({ role });
    useAuth.mockReturnValue({ login });
    const tela = await render(<LoginScreen navigation={navigation} />);
    await fireEvent.changeText(tela.getByPlaceholderText('Digite seu usuário'), '  ana  ');
    await fireEvent.changeText(tela.getByPlaceholderText('Digite sua senha'), 'segredo');
    await fireEvent.press(tela.getByText('Entrar'));
    await waitFor(() => expect(login).toHaveBeenCalledWith('ana', 'segredo'));
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: destino }],
    });
  });

  test('exibe erro de autenticação', async () => {
    useAuth.mockReturnValue({ login: jest.fn().mockRejectedValue(new Error('Negado')) });
    const tela = await render(<LoginScreen navigation={navigation} />);
    await fireEvent.changeText(tela.getByPlaceholderText('Digite seu usuário'), 'ana');
    await fireEvent.changeText(tela.getByPlaceholderText('Digite sua senha'), 'x');
    await fireEvent.press(tela.getByText('Entrar'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Erro ao entrar', 'Negado'));
  });
});

test('RegisterScreen renderiza formulário e navega', async () => {
  const register = jest.fn().mockResolvedValue({ id: 1 });
  useAuth.mockReturnValue({ register });
  const tela = await render(<RegisterScreen navigation={navigation} />);
  expect(tela.getByText('Cadastro')).toBeTruthy();
  await fireEvent.changeText(tela.getByPlaceholderText('User name'), 'ana');
  await fireEvent.changeText(tela.getByPlaceholderText('Endereço de e-mail'), 'ana@email.com');
  await fireEvent.changeText(tela.getByPlaceholderText('Senha'), 'segredo');
  await fireEvent.changeText(tela.getByPlaceholderText('Confirme sua senha'), 'segredo');
  await fireEvent.changeText(tela.getByPlaceholderText('Endereço'), 'Rua A');
  await fireEvent.changeText(tela.getByPlaceholderText('Cep'), '99000000');
  await fireEvent.press(tela.getByText('Criar conta'));
  await waitFor(() => expect(register).toHaveBeenCalled());
  expect(navigation.navigate).toHaveBeenCalledWith('Login');
  await fireEvent.press(tela.getByText('arrow-back'));
  expect(navigation.goBack).toHaveBeenCalled();
});

test('ProfileScreen abre drawer e alteração de senha', async () => {
  const tela = await render(<ProfileScreen />);
  expect(tela.getByText('Perfil do usuário')).toBeTruthy();
  await fireEvent.press(tela.getByText('menu'));
  await fireEvent.press(tela.getByText('Alterar senha'));
  expect(DrawerActions.openDrawer).toHaveBeenCalled();
  expect(navigation.dispatch).toHaveBeenCalledWith({ type: 'OPEN_DRAWER' });
  expect(navigation.navigate).toHaveBeenCalledWith('AlterarSenha');
});

test('ChangePasswordScreen confirma e volta ao perfil', async () => {
  userService.alterarSenha.mockResolvedValue({ message: 'ok' });
  const tela = await render(<ChangePasswordScreen navigation={navigation} />);
  await fireEvent.changeText(tela.getAllByDisplayValue('')[0], 'senha-atual');
  await fireEvent.changeText(tela.getAllByDisplayValue('')[0], 'nova123');
  await fireEvent.changeText(tela.getAllByDisplayValue('')[0], 'nova123');
  await fireEvent.press(tela.getByText('Salvar'));
  await waitFor(() => expect(userService.alterarSenha).toHaveBeenCalledWith({
    senhaAtual: 'senha-atual',
    novaSenha: 'nova123',
    confirmacaoNovaSenha: 'nova123',
  }));
  expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Senha alterada com sucesso!');
  expect(navigation.goBack).toHaveBeenCalled();
});

test('HomeScreen renderiza best sellers', async () => {
  produtos.listarProdutos.mockResolvedValue(
    Array.from({ length: 7 }, (_, i) => ({ id: i + 1, nome: i === 0 ? 'Chave em T' : `Produto ${i}` }))
  );
  const tela = await render(<HomeScreen navigation={navigation} />);
  expect(tela.getByText('Best Sellers')).toBeTruthy();
  await waitFor(() => expect(tela.getByText('Produto:Chave em T')).toBeTruthy());
  expect(tela.getAllByText(/Produto:/)).toHaveLength(7);
});

test('NewsScreen renderiza novidades e abre drawer', async () => {
  produtos.listarProdutos.mockResolvedValue([{ id: 1, nome: 'Novo Shape Petunia' }]);
  const tela = await render(<NewsScreen navigation={navigation} />);
  await waitFor(() => expect(tela.getByText('Produto:Novo Shape Petunia')).toBeTruthy());
});

test('ContactScreen renderiza canais de contato', async () => {
  const tela = await render(<ContactScreen navigation={navigation} />);
  expect(tela.getByText('contato@skateshop.com.br')).toBeTruthy();
  expect(tela.getByText('(11) 99999-0000')).toBeTruthy();
});

test('AboutScreen renderiza conteúdo institucional', async () => {
  const tela = await render(<AboutScreen navigation={navigation} />);
  await waitFor(() => expect(tela.getByText('Skateshop')).toBeTruthy());
  expect(tela.getByText(/loja especializada em skate/)).toBeTruthy();
});
