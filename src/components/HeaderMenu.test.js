import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderMenu from './HeaderMenu';

jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn() }));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }) => <Text>{name}</Text> };
});

test('abre drawer e navega pelo menu superior', async () => {
  const navigation = { openDrawer: jest.fn(), navigate: jest.fn() };
  useNavigation.mockReturnValue(navigation);
  const tela = await render(<HeaderMenu />);
  await fireEvent.press(tela.getByText('menu'));
  await fireEvent.press(tela.getByText('Novidades'));
  await fireEvent.press(tela.getByText('Sobre'));
  await fireEvent.press(tela.getByText('Contato'));
  expect(navigation.openDrawer).toHaveBeenCalled();
  expect(navigation.navigate.mock.calls).toEqual([
    ['Novidades'],
    ['Sobre'],
    ['Contato'],
  ]);
});
