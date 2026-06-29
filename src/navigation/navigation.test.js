import React from 'react';
import { render } from '@testing-library/react-native';
import AppNavigator from './AppNavigator';
import DrawerNavigator from './DrawerNavigator';

const mockStackScreens = [];
const mockDrawerScreens = [];

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children, ...props }) => {
      const { Text, View } = require('react-native');
      return <View><Text>Stack:{props.initialRouteName}</Text>{children}</View>;
    },
    Screen: (props) => {
      const { Text } = require('react-native');
      mockStackScreens.push(props);
      return <Text>StackScreen:{props.name}</Text>;
    },
  }),
}));
jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: () => ({
    Navigator: ({ children }) => {
      const { View } = require('react-native');
      return <View>{children}</View>;
    },
    Screen: (props) => {
      const { Text } = require('react-native');
      mockDrawerScreens.push(props);
      return <Text>DrawerScreen:{props.name}</Text>;
    },
  }),
}));

jest.mock('../screens/LoginScreen', () => () => null);
jest.mock('../screens/RegisterScreen', () => () => null);
jest.mock('../screens/AdminHomeScreen', () => () => null);
jest.mock('../screens/EditProductScreen', () => () => null);
jest.mock('../screens/AddProductScreen', () => () => null);
jest.mock('../screens/ChangePasswordScreen', () => () => null);
jest.mock('../screens/CheckoutScreen', () => () => null);
jest.mock('../screens/PaymentSuccessScreen', () => () => null);
jest.mock('../screens/OrdersScreen', () => () => null);
jest.mock('../screens/AboutScreen', () => () => null);
jest.mock('../screens/HomeScreen', () => () => null);
jest.mock('../screens/CartScreen', () => () => null);
jest.mock('../screens/ProfileScreen', () => () => null);
jest.mock('../screens/NewsScreen', () => () => null);
jest.mock('../screens/ContactScreen', () => () => null);

test('AppNavigator declara stack e rota inicial', async () => {
  const tela = await render(<AppNavigator />);
  expect(tela.getByText('Stack:Login')).toBeTruthy();
  expect(mockStackScreens.map((s) => s.name)).toEqual([
    'Login',
    'Cadastro',
    'App',
    'AdminHome',
    'EditarProduto',
    'AdicionarProduto',
    'AlterarSenha',
    'Checkout',
    'PagamentoConfirmado',
    'Pedidos',
    'Sobre',
  ]);
});

test('DrawerNavigator declara todas as áreas atuais', async () => {
  await render(<DrawerNavigator />);
  expect(mockDrawerScreens.map((s) => s.name)).toEqual([
    'Home',
    'Pedidos',
    'Carrinho',
    'Perfil',
    'Novidades',
    'Sobre',
    'Contato',
  ]);
});
