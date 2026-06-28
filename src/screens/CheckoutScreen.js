import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomMenu from '../components/BottomMenu';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { imagemPrincipal, listarSugestoes } from '../services/produtoService';
import { extrairMensagemErro } from '../utils/erroApi';
import { formatarPreco } from '../utils/formatarPreco';

const METODOS = [
  { valor: 'Cartao', label: 'Cartão' },
  { valor: 'Pix', label: 'PIX' },
  { valor: 'Boleto', label: 'Boleto' },
];

export default function CheckoutScreen({ navigation }) {
  const { usuario } = useAuth();
  const { itens, valorTotal, limparCarrinho } = useCart();

  const [metodoPagamento, setMetodoPagamento] = useState('Cartao');
  const [enviando, setEnviando] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [carregandoSugestoes, setCarregandoSugestoes] = useState(true);

  // Carrega "outros produtos" em paralelo, sem travar o checkout.
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const dados = await listarSugestoes();
        if (ativo) setSugestoes(dados);
      } catch (e) {
        // Silencioso: as sugestões não devem impedir a finalização.
      } finally {
        if (ativo) setCarregandoSugestoes(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  async function finalizarCompra() {
    if (!usuario) {
      Alert.alert('Login necessário', 'Faça login para finalizar a compra.');
      navigation.navigate('Login');
      return;
    }
    if (itens.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos antes de finalizar.');
      return;
    }

    const payload = {
      itens: itens.map(({ produto, quantidade }) => ({
        fkIdProduto: produto.id,
        quantidade,
      })),
      metodoPagamento,
    };

    try {
      setEnviando(true);
      const { data } = await api.post('/orders', payload);
      limparCarrinho();
      Alert.alert('Pedido confirmado!', `Pedido #${data.id} criado com sucesso.`);
      navigation.navigate('PagamentoConfirmado');
    } catch (e) {
      // Estoque insuficiente / validação (400) etc. — não limpa o carrinho.
      Alert.alert('Não foi possível finalizar', extrairMensagemErro(e, 'Erro ao finalizar a compra.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Ionicons
            name="arrow-back"
            size={36}
            color="#000"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Finalizar compra</Text>
        </View>

        <Text style={styles.section}>Resumo do pedido</Text>
        {itens.length === 0 ? (
          <Text style={styles.aviso}>Seu carrinho está vazio.</Text>
        ) : (
          <>
            {itens.map(({ produto, quantidade }) => {
              const uri = imagemPrincipal(produto);
              return (
                <View style={styles.resumoItem} key={produto.id}>
                  <Image source={uri ? { uri } : undefined} style={styles.resumoImg} />
                  <Text style={styles.resumoNome}>{produto.nome}</Text>
                  <Text style={styles.resumoQtd}>{quantidade}x</Text>
                  <Text style={styles.resumoPreco}>
                    R$ {formatarPreco(produto.precoAtual * quantidade)}
                  </Text>
                </View>
              );
            })}
            <View style={styles.totalLinha}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValor}>R$ {formatarPreco(valorTotal)}</Text>
            </View>
          </>
        )}

        <Text style={styles.section}>Identifique-se</Text>
        <TextInput placeholder="Nome:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="E-mail:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="CPF:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="Telefone:" placeholderTextColor="#000" style={styles.input} />

        <Text style={styles.section}>Entrega</Text>
        <TextInput placeholder="CEP:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="Endereço:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="Número:" placeholderTextColor="#000" style={styles.input} />

        <Text style={styles.section}>Pagamento</Text>
        {METODOS.map((m) => (
          <TouchableOpacity
            key={m.valor}
            style={[styles.input, metodoPagamento === m.valor && styles.inputSelecionado]}
            onPress={() => setMetodoPagamento(m.valor)}
          >
            <Text style={styles.inputText}>{m.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.button}
          onPress={finalizarCompra}
          disabled={enviando}
        >
          <Text style={styles.buttonText}>
            {enviando ? 'Finalizando...' : 'Finalizar compra'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.section, styles.sugestoesTitulo]}>Outros produtos</Text>
        {carregandoSugestoes ? (
          <ActivityIndicator size="small" color="#000" style={{ marginTop: 10 }} />
        ) : (
          <View style={styles.sugestoes}>
            {sugestoes.map((p) => (
              <ProductCard key={p.id} item={p} />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  menu: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 12,
  },

  menuText: {
    color: '#fff',
    fontSize: 14,
  },

  content: {
    padding: 18,
    paddingTop: 55,
    paddingBottom: 40,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  section: {
    fontSize: 20,
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#d8d6d6',
    height: 42,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    fontSize: 16,
    marginBottom: 8,
  },

  inputText: {
    fontSize: 16,
  },

  inputSelecionado: {
    borderWidth: 2,
    borderColor: '#000',
  },

  aviso: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },

  resumoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  resumoImg: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
    marginRight: 10,
  },

  resumoNome: {
    flex: 1,
    fontSize: 15,
  },

  resumoQtd: {
    fontSize: 15,
    marginHorizontal: 8,
  },

  resumoPreco: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  totalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#000',
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 10,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  totalValor: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 22,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
  },

  sugestoesTitulo: {
    marginTop: 30,
  },

  sugestoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  bottom: {
    height: 60,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
