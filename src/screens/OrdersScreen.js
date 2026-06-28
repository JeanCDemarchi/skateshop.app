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
import HeaderMenu from '../components/HeaderMenu';
import { useAuth } from '../context/AuthContext';
import { listarPedidos } from '../services/pedidoService';
import { imagemPrincipal } from '../services/produtoService';
import { formatarPreco } from '../utils/formatarPreco';

function formatarData(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export default function OrdersScreen({ navigation }) {
  const { usuario } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await listarPedidos();
      setPedidos(dados);
    } catch (e) {
      setErro('Não foi possível carregar seus pedidos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega ao focar a tela (ex.: depois de finalizar uma compra).
  useFocusEffect(
    useCallback(() => {
      if (usuario) carregar();
    }, [usuario, carregar])
  );

  function rastrear(pedido) {
    const envio = pedido.envio || {};
    const codigo = envio.codigoRastreio ? `\nCódigo: ${envio.codigoRastreio}` : '';
    Alert.alert('Rastreamento', `Status: ${envio.statusEntrega || pedido.status}${codigo}`);
  }

  // Sem usuário logado: a rota é protegida, então mostramos um estado claro.
  if (!usuario) {
    return (
      <View style={styles.container}>
        <HeaderMenu navigation={navigation} />
        <Text style={styles.aviso}>Faça login para ver seus pedidos.</Text>
        <BottomMenu />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />

      {carregando ? (
        <ActivityIndicator size="large" color="#111" style={styles.loading} />
      ) : erro ? (
        <Text style={styles.aviso}>{erro}</Text>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.aviso}>Você ainda não fez pedidos.</Text>}
          renderItem={({ item }) => {
            const primeiro = item.itens?.[0]?.produto;
            const uri = primeiro ? imagemPrincipal(primeiro) : null;
            const qtd = item.itens?.reduce((s, i) => s + i.quantidade, 0) ?? 0;
            return (
              <View style={styles.order}>
                <Image source={uri ? { uri } : undefined} style={styles.image} />

                <View style={styles.info}>
                  <Text style={styles.code}>Pedido #{item.id}</Text>
                  <Text style={styles.details}>
                    {formatarData(item.dataPedido)} · {qtd} item(s)
                  </Text>
                  <Text style={styles.details}>
                    R$ {formatarPreco(item.valorTotal)} · {item.envio?.statusEntrega || item.status}
                  </Text>

                  <TouchableOpacity style={styles.button} onPress={() => rastrear(item)}>
                    <Text style={styles.buttonText}>Rastrear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  logo: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },

  menu: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 25,
  },

  menuText: {
    color: '#fff',
    fontSize: 24,
  },

  loading: {
    marginTop: 40,
  },

  aviso: {
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#555',
  },

  titleRow: {
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
  },

  order: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 22,
    paddingHorizontal: 30,
    alignItems: 'center',
  },

  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginRight: 30,
  },

  info: {
    flex: 1,
  },

  code: {
    fontSize: 22,
    marginBottom: 8,
  },

  details: {
    fontSize: 18,
    marginBottom: 14,
  },

  button: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: 160,
  },

  buttonText: {
    color: '#fff',
    fontSize: 22,
  },

  bottom: {
    height: 70,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
