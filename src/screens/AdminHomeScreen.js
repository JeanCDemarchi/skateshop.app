import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomMenu from '../components/BottomMenu';
import { useAuth } from '../context/AuthContext';
import {
  excluirProduto as excluirProdutoApi,
  imagemPrincipal,
  listarProdutos,
} from '../services/produtoService';
import { extrairMensagemErro } from '../utils/erroApi';
import { formatarPreco } from '../utils/formatarPreco';

export default function AdminHomeScreen({ navigation }) {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.role === 'admin';

  const [products, setProducts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarProdutos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await listarProdutos();
      setProducts(dados);
    } catch (e) {
      setErro('Não foi possível carregar os produtos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega a lista sempre que a tela ganha foco (após criar/editar/excluir).
  useFocusEffect(
    useCallback(() => {
      if (ehAdmin) carregarProdutos();
    }, [ehAdmin, carregarProdutos])
  );

  function confirmarExclusao(item) {
    Alert.alert(
      'Excluir produto',
      `Tem certeza que deseja excluir "${item.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluir(item.id) },
      ]
    );
  }

  async function excluir(id) {
    try {
      await excluirProdutoApi(id);
      setProducts((atual) => atual.filter((p) => p.id !== id));
      Alert.alert('Pronto', 'Produto excluído com sucesso.');
    } catch (e) {
      if (e?.response?.status === 409) {
        // Produto vinculado a pedidos — não pode ser excluído.
        Alert.alert(
          'Não é possível excluir',
          extrairMensagemErro(e, 'Este produto está vinculado a pedidos existentes.')
        );
      } else {
        Alert.alert('Erro', extrairMensagemErro(e, 'Não foi possível excluir o produto.'));
      }
    }
  }

  // Bloqueio de acesso para não-admins.
  if (!ehAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.centro}>
          <Text style={styles.restrito}>Acesso restrito a administradores.</Text>
        </View>
        <BottomMenu />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {carregando ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : erro ? (
        <Text style={styles.restrito}>{erro}</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.restrito}>Nenhum produto cadastrado.</Text>}
          renderItem={({ item }) => {
            const uri = imagemPrincipal(item);
            return (
              <View style={styles.card}>
                <Image source={uri ? { uri } : undefined} style={styles.image} />

                <View style={styles.info}>
                  <Text>{item.nome}</Text>
                  <Text>{item.estoqueAtual} unidades</Text>
                  <Text>R$ {formatarPreco(item.precoAtual)}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => confirmarExclusao(item)}>
                    <Ionicons name="trash-outline" size={24} color="#000" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => navigation.navigate('EditarProduto', { produto: item })}>
                    <Ionicons name="pencil-outline" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AdicionarProduto')}
      >
        <Ionicons name="add" size={38} color="#fff" />
      </TouchableOpacity>

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  restrito: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#555',
    paddingHorizontal: 20,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#000',
  },

  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginRight: 15,
  },

  info: {
    flex: 1,
  },

  actions: {
    gap: 18,
    alignItems: 'center',
  },
  addButton: {
  position: 'absolute',
  right: 20,
  bottom: 90,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#000',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5,
  },
});
