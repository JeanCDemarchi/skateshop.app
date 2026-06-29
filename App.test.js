import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('./src/context/AuthContext', () => ({
  AuthProvider: ({ children }) => {
    const { Text, View } = require('react-native');
    return <View><Text>AuthProvider</Text>{children}</View>;
  },
}));
jest.mock('./src/context/CartContext', () => ({
  CartProvider: ({ children }) => {
    const { Text, View } = require('react-native');
    return <View><Text>CartProvider</Text>{children}</View>;
  },
}));
jest.mock('./src/navigation/AppNavigator', () => {
  const { Text } = require('react-native');
  return () => <Text>AppNavigator</Text>;
});

test('compõe autenticação, carrinho e navegação', async () => {
  const tela = await render(<App />);
  expect(tela.getByText('AuthProvider')).toBeTruthy();
  expect(tela.getByText('CartProvider')).toBeTruthy();
  expect(tela.getByText('AppNavigator')).toBeTruthy();
});
