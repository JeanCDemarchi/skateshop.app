import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import BottomMenu from './BottomMenu';

jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn() }));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }) => <Text>{name}</Text> };
});

test('navega para as quatro áreas principais', async () => {
  const navigation = { navigate: jest.fn() };
  useNavigation.mockReturnValue(navigation);
  const tela = await render(<BottomMenu />);
  for (const icone of [
    'home-outline',
    'notifications-outline',
    'cart-outline',
    'person-outline',
  ]) {
    await fireEvent.press(tela.getByText(icone));
  }
  expect(navigation.navigate.mock.calls).toEqual([
    ['Home'],
    ['Pedidos'],
    ['Carrinho'],
    ['Perfil'],
  ]);
});
