import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import * as pedidos from '../services/pedidoService';
import * as produtos from '../services/produtoService';
import { selecionarImagens } from '../utils/imagePicker';

import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import PaymentSuccessScreen from './PaymentSuccessScreen';
import OrdersScreen from './OrdersScreen';
import AdminHomeScreen from './AdminHomeScreen';
import AddProductScreen from './AddProductScreen';
import EditProductScreen from './EditProductScreen';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name, onPress }) => <Text onPress={onPress}>{name}</Text> };
});
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => {
    const React = require('react');
    React.useEffect(callback, []);
  }),
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
  return ({ item }) => <Text>Sugestão:{item.nome}</Text>;
});
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../context/CartContext', () => ({ useCart: jest.fn() }));
jest.mock('../services/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn() },
}));
jest.mock('../services/pedidoService', () => ({
  listarPedidos: jest.fn(),
  obterPedido: jest.fn(),
}));
jest.mock('../services/produtoService', () => ({
  listarProdutos: jest.fn(),
  listarSugestoes: jest.fn(),
  criarProduto: jest.fn(),
  excluirProduto: jest.fn(),
  atualizarProduto: jest.fn(),
  imagemPrincipal: jest.fn(() => 'https://imagem.ficticia/item.png'),
}));
jest.mock('../utils/imagePicker', () => ({
  selecionarImagens: jest.fn(),
  assetParaArquivo: jest.fn((asset) => asset),
}));

const navigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};
const produto = { id: 1, nome: 'Shape', precoAtual: 100, estoqueAtual: 3 };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  useAuth.mockReturnValue({ usuario: { id: 7, role: 'cliente' } });
  produtos.listarSugestoes.mockResolvedValue([]);
  pedidos.listarPedidos.mockResolvedValue([]);
});

test('CartScreen mostra estado vazio', async () => {
  useCart.mockReturnValue({ itens: [], valorTotal: 0, removerDoCarrinho: jest.fn() });
  const tela = await render(<CartScreen navigation={navigation} />);
  expect(tela.getByText('Seu carrinho está vazio.')).toBeTruthy();
});

test('CartScreen renderiza item, remove e navega ao checkout', async () => {
  const removerDoCarrinho = jest.fn();
  useCart.mockReturnValue({
    itens: [{ produto, quantidade: 2 }],
    valorTotal: 200,
    removerDoCarrinho,
  });
  const tela = await render(<CartScreen navigation={navigation} />);
  expect(tela.getAllByText('R$ 200,00').length).toBeGreaterThan(0);
  await fireEvent.press(tela.getByText('trash-outline'));
  await fireEvent.press(tela.getAllByText('Finalizar compra').at(-1));
  expect(removerDoCarrinho).toHaveBeenCalledWith(1);
  expect(navigation.navigate).toHaveBeenCalledWith('Checkout');
});

test('Checkout exige login', async () => {
  useAuth.mockReturnValue({ usuario: null });
  useCart.mockReturnValue({ itens: [], valorTotal: 0, limparCarrinho: jest.fn() });
  const tela = await render(<CheckoutScreen navigation={navigation} />);
  await waitFor(() => expect(produtos.listarSugestoes).toHaveBeenCalled());
  await fireEvent.press(tela.getAllByText('Finalizar compra').at(-1));
  expect(Alert.alert).toHaveBeenCalledWith(
    'Login necessário',
    'Faça login para finalizar a compra.'
  );
  expect(navigation.navigate).toHaveBeenCalledWith('Login');
});

test('Checkout finaliza pedido e limpa carrinho', async () => {
  const limparCarrinho = jest.fn();
  useAuth.mockReturnValue({ usuario: { id: 7 } });
  useCart.mockReturnValue({
    itens: [{ produto, quantidade: 2 }],
    valorTotal: 200,
    limparCarrinho,
  });
  produtos.listarSugestoes.mockResolvedValue([{ id: 2, nome: 'Truck' }]);
  api.post.mockResolvedValue({ data: { id: 55 } });
  const tela = await render(<CheckoutScreen navigation={navigation} />);
  await waitFor(() => expect(tela.getByText('Sugestão:Truck')).toBeTruthy());
  await fireEvent.press(tela.getByText('PIX'));
  await fireEvent.press(tela.getAllByText('Finalizar compra').at(-1));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith('/orders', {
      itens: [{ fkIdProduto: 1, quantidade: 2 }],
      metodoPagamento: 'Pix',
    })
  );
  expect(limparCarrinho).toHaveBeenCalled();
  expect(navigation.navigate).toHaveBeenCalledWith('PagamentoConfirmado');
});

test('PaymentSuccessScreen volta aos pedidos', async () => {
  const tela = await render(<PaymentSuccessScreen navigation={navigation} />);
  expect(tela.getByText(/pagamento/)).toBeTruthy();
  await fireEvent.press(tela.getByText('Voltar ao inicio'));
  expect(navigation.navigate).toHaveBeenCalledWith('App', { screen: 'Pedidos' });
});

test('OrdersScreen renderiza os pedidos locais', async () => {
  pedidos.listarPedidos.mockResolvedValue([
    {
      id: 58466,
      dataPedido: '2026-06-27T12:00:00.000Z',
      valorTotal: 100,
      status: 'Enviado',
      envio: { statusEntrega: 'Em transporte' },
      itens: [{ quantidade: 1, produto }],
    },
    {
      id: 58467,
      dataPedido: '2026-06-28T12:00:00.000Z',
      valorTotal: 200,
      status: 'Separando',
      envio: { statusEntrega: 'Separando' },
      itens: [{ quantidade: 2, produto }],
    },
    {
      id: 58468,
      dataPedido: '2026-06-29T12:00:00.000Z',
      valorTotal: 300,
      status: 'Entregue',
      envio: { statusEntrega: 'Entregue' },
      itens: [{ quantidade: 3, produto }],
    },
  ]);
  const tela = await render(<OrdersScreen navigation={navigation} />);
  await waitFor(() => expect(tela.getByText('Pedido #58466')).toBeTruthy());
  expect(tela.getAllByText('Rastrear')).toHaveLength(3);
});

test('AdminHomeScreen bloqueia usuário comum', async () => {
  useAuth.mockReturnValue({ usuario: { role: 'cliente' } });
  const tela = await render(<AdminHomeScreen navigation={navigation} />);
  expect(tela.getByText('Acesso restrito a administradores.')).toBeTruthy();
  expect(produtos.listarProdutos).not.toHaveBeenCalled();
});

test('AdminHomeScreen lista produtos e abre edição/criação', async () => {
  useAuth.mockReturnValue({ usuario: { role: 'admin' } });
  produtos.listarProdutos.mockResolvedValue([produto]);
  const tela = await render(<AdminHomeScreen navigation={navigation} />);
  await waitFor(() => expect(tela.getByText('Shape')).toBeTruthy());
  await fireEvent.press(tela.getByText('pencil-outline'));
  await fireEvent.press(tela.getByText('add'));
  expect(navigation.navigate).toHaveBeenCalledWith('EditarProduto', { produto });
  expect(navigation.navigate).toHaveBeenCalledWith('AdicionarProduto');
});

test('AddProductScreen renderiza formulário de cadastro', async () => {
  const tela = await render(<AddProductScreen navigation={navigation} />);
  expect(tela.getByText('Nome e descrição')).toBeTruthy();
  expect(tela.getByPlaceholderText('Nome')).toBeTruthy();
  expect(tela.getByText('Adicionar produto')).toBeTruthy();
});

test('EditProductScreen informa quando não há alterações', async () => {
  const tela = await render(
    <EditProductScreen route={{ params: { produto } }} navigation={navigation} />
  );
  await fireEvent.press(tela.getByText('Salvar alterações'));
  expect(Alert.alert).toHaveBeenCalledWith(
    'Editar produto',
    'Nenhuma alteração para salvar.'
  );
});

test.each([
  ['Shape', '   ', 'O nome não pode ficar vazio.'],
  ['100', '0', 'Informe um preço válido (maior que 0).'],
  ['3', '-1', 'Informe um estoque válido (inteiro, 0 ou mais).'],
])('EditProductScreen valida alteração de %s', async (atual, novo, mensagem) => {
  const tela = await render(
    <EditProductScreen route={{ params: { produto } }} navigation={navigation} />
  );
  await fireEvent.changeText(tela.getByDisplayValue(atual), novo);
  await fireEvent.press(tela.getByText('Salvar alterações'));
  expect(Alert.alert).toHaveBeenCalledWith('Atenção', mensagem);
});

test('EditProductScreen salva JSON com preço brasileiro', async () => {
  produtos.atualizarProduto.mockResolvedValue({});
  const tela = await render(
    <EditProductScreen route={{ params: { produto } }} navigation={navigation} />
  );
  await fireEvent.changeText(tela.getByDisplayValue('Shape'), ' Shape Pro ');
  await fireEvent.changeText(tela.getByDisplayValue('100'), '1.234,50');
  await fireEvent.changeText(tela.getByDisplayValue('3'), '8');
  await fireEvent.press(tela.getByText('Salvar alterações'));
  await waitFor(() =>
    expect(produtos.atualizarProduto).toHaveBeenCalledWith(
      1,
      { nome: 'Shape Pro', precoAtual: 1234.5, estoqueAtual: 8 },
      false
    )
  );
  expect(navigation.goBack).toHaveBeenCalled();
});

test('EditProductScreen seleciona foto e salva multipart', async () => {
  selecionarImagens.mockResolvedValue({ assets: [{ uri: 'file:///ficticia.png' }] });
  produtos.atualizarProduto.mockResolvedValue({});
  const tela = await render(
    <EditProductScreen route={{ params: { produto } }} navigation={navigation} />
  );
  await fireEvent.press(tela.getByText('Adicionar novas fotos'));
  await waitFor(() => expect(tela.getByText('1 nova(s) foto(s)')).toBeTruthy());
  await fireEvent.press(tela.getByText('Salvar alterações'));
  await waitFor(() =>
    expect(produtos.atualizarProduto).toHaveBeenCalledWith(1, expect.any(FormData), true)
  );
});

test.each([
  [{ erro: 'Permissão negada' }, true],
  [{ assets: [] }, false],
])('EditProductScreen trata seletor %p', async (retorno, alerta) => {
  selecionarImagens.mockResolvedValue(retorno);
  const tela = await render(
    <EditProductScreen route={{ params: { produto } }} navigation={navigation} />
  );
  await fireEvent.press(tela.getByText('Adicionar novas fotos'));
  alerta
    ? expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Permissão negada')
    : expect(tela.getByText('Adicionar novas fotos')).toBeTruthy();
});

test.each([
  [{ response: { status: 404 } }, ['Não encontrado', 'Este produto não existe mais.']],
  [new Error('falha'), ['Erro', 'Não foi possível editar o produto.']],
])('EditProductScreen recupera erro', async (falha, alerta) => {
  produtos.atualizarProduto.mockRejectedValue(falha);
  const tela = await render(
    <EditProductScreen route={{ params: { produto } }} navigation={navigation} />
  );
  await fireEvent.changeText(tela.getByDisplayValue('Shape'), 'Outro');
  await fireEvent.press(tela.getByText('Salvar alterações'));
  await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith(...alerta));
});

test('AddProductScreen valida campos obrigatórios', async () => {
  const tela = await render(<AddProductScreen navigation={navigation} />);
  await fireEvent.press(tela.getByText('Adicionar produto'));
  expect(Alert.alert).toHaveBeenCalledWith('Atenção', 'Preencha nome e descrição.');
});

test('AddProductScreen seleciona foto e cria produto', async () => {
  selecionarImagens.mockResolvedValue({ assets: [{ uri: 'file:///produto.png' }] });
  produtos.criarProduto.mockResolvedValue({ id: 9 });
  const tela = await render(<AddProductScreen navigation={navigation} />);
  await fireEvent.changeText(tela.getByPlaceholderText('Nome'), 'Shape novo');
  await fireEvent.changeText(tela.getByPlaceholderText('Descrição'), 'Shape completo');
  await fireEvent.changeText(tela.getByPlaceholderText('R$ 0,00'), '199,90');
  await fireEvent.changeText(tela.getByPlaceholderText('0'), '5');
  await fireEvent.press(tela.getByText('Selecione fotos do produto'));
  await waitFor(() => expect(tela.getByText('1 foto(s) selecionada(s)')).toBeTruthy());
  await fireEvent.press(tela.getByText('Adicionar produto'));
  await waitFor(() => expect(produtos.criarProduto).toHaveBeenCalledWith(expect.any(FormData)));
  expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Produto adicionado com sucesso!');
  expect(navigation.goBack).toHaveBeenCalled();
});

test.each([
  [[], 'Nenhum produto cadastrado.'],
  [new Error('falha'), 'Não foi possível carregar os produtos.'],
])('AdminHomeScreen trata carregamento %p', async (resultado, texto) => {
  useAuth.mockReturnValue({ usuario: { role: 'admin' } });
  resultado instanceof Error
    ? produtos.listarProdutos.mockRejectedValue(resultado)
    : produtos.listarProdutos.mockResolvedValue(resultado);
  const tela = await render(<AdminHomeScreen navigation={navigation} />);
  await waitFor(() => expect(tela.getByText(texto)).toBeTruthy());
});

test.each([
  [null, ['Pronto', 'Produto excluído com sucesso.']],
  [
    { response: { status: 409, data: { error: 'Produto vinculado' } } },
    ['Não é possível excluir', 'Produto vinculado'],
  ],
  [new Error('falha'), ['Erro', 'Não foi possível excluir o produto.']],
])('AdminHomeScreen trata exclusão', async (falha, alerta) => {
  useAuth.mockReturnValue({ usuario: { role: 'admin' } });
  produtos.listarProdutos.mockResolvedValue([produto]);
  falha
    ? produtos.excluirProduto.mockRejectedValue(falha)
    : produtos.excluirProduto.mockResolvedValue({});
  const tela = await render(<AdminHomeScreen navigation={navigation} />);
  await waitFor(() => expect(tela.getByText('Shape')).toBeTruthy());
  await fireEvent.press(tela.getByText('trash-outline'));
  const chamada = Alert.alert.mock.calls.find(([titulo]) => titulo === 'Excluir produto');
  chamada[2][1].onPress();
  await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith(...alerta));
});

test('Checkout trata carrinho vazio, voltar e erro do pedido', async () => {
  useAuth.mockReturnValue({ usuario: { id: 7 } });
  useCart.mockReturnValue({ itens: [], valorTotal: 0, limparCarrinho: jest.fn() });
  produtos.listarSugestoes.mockRejectedValue(new Error('silencioso'));
  const vazia = await render(<CheckoutScreen navigation={navigation} />);
  await fireEvent.press(vazia.getByText('arrow-back'));
  await fireEvent.press(vazia.getAllByText('Finalizar compra').at(-1));
  expect(navigation.goBack).toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(
    'Carrinho vazio',
    'Adicione produtos antes de finalizar.'
  );

  useCart.mockReturnValue({
    itens: [{ produto, quantidade: 1 }],
    valorTotal: 100,
    limparCarrinho: jest.fn(),
  });
  api.post.mockRejectedValue({ response: { data: { error: 'Sem estoque' } } });
  const tela = await render(<CheckoutScreen navigation={navigation} />);
  await fireEvent.press(tela.getByText('Boleto'));
  await fireEvent.press(tela.getAllByText('Finalizar compra').at(-1));
  await waitFor(() =>
    expect(Alert.alert).toHaveBeenCalledWith('Não foi possível finalizar', 'Sem estoque')
  );
});
