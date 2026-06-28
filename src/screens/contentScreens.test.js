import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

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
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }) => <Text>{name}</Text> };
});
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));
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
  reset: jest.fn(),
  openDrawer: jest.fn(),
};

beforeEach(() => {
  useNavigation.mockReturnValue(navigation);
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
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
  const tela = await render(<RegisterScreen navigation={navigation} />);
  expect(tela.getByText('Cadastro')).toBeTruthy();
  await fireEvent.press(tela.getByText('Criar conta'));
  await fireEvent.press(tela.getByText('Voltar ao Login'));
  expect(navigation.navigate.mock.calls).toEqual([['App'], ['Login']]);
});

test('ProfileScreen abre drawer e alteração de senha', async () => {
  const tela = await render(<ProfileScreen />);
  expect(tela.getByText('Perfil do usuário')).toBeTruthy();
  await fireEvent.press(tela.getByText('menu'));
  await fireEvent.press(tela.getByText('Alterar senha'));
  expect(navigation.openDrawer).toHaveBeenCalled();
  expect(navigation.navigate).toHaveBeenCalledWith('AlterarSenha');
});

test('ChangePasswordScreen confirma e volta ao perfil', async () => {
  const tela = await render(<ChangePasswordScreen />);
  await fireEvent.press(tela.getByText('Salvar'));
  expect(Alert.alert).toHaveBeenCalledWith(
    'Sucesso',
    'Senha alterada com sucesso!',
    expect.any(Array)
  );
  Alert.alert.mock.calls[0][2][0].onPress();
  expect(navigation.navigate).toHaveBeenCalledWith('App', { screen: 'Perfil' });
});

test('HomeScreen renderiza best sellers', async () => {
  const tela = await render(<HomeScreen navigation={navigation} />);
  expect(tela.getByText('Best Sellers')).toBeTruthy();
  expect(tela.getByText('Produto:Chave em T')).toBeTruthy();
  expect(tela.getAllByText(/Produto:/)).toHaveLength(7);
});

test('NewsScreen renderiza novidades e abre drawer', async () => {
  const tela = await render(<NewsScreen navigation={navigation} />);
  expect(tela.getByText('Novo Shape Petunia')).toBeTruthy();
  await fireEvent.press(tela.getByText('menu'));
  expect(navigation.openDrawer).toHaveBeenCalled();
});

test('ContactScreen renderiza canais de contato', async () => {
  const tela = await render(<ContactScreen />);
  expect(tela.getByText('suporte@skateshop.com')).toBeTruthy();
  expect(tela.getByText('(54) 99999-9999')).toBeTruthy();
});

test('AboutScreen renderiza objetivo e versão', async () => {
  const tela = await render(<AboutScreen />);
  expect(tela.getByText('Objetivo')).toBeTruthy();
  expect(tela.getByText(/Versão 1.0.0/)).toBeTruthy();
});
