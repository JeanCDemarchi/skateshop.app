import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';
import ProductCard from '../components/ProductCard';
import { listarProdutos } from '../services/produtoService';

export default function NewsScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        setCarregando(true);
        setErro(null);
        // "Novidades" = produtos mais recentes (a API já retorna por id desc).
        const dados = await listarProdutos();
        if (ativo) setProdutos(dados);
      } catch (e) {
        if (ativo) setErro('Não foi possível carregar as novidades. Verifique sua conexão.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />

      <Text style={styles.title}>Novidades</Text>

      {carregando ? (
        <ActivityIndicator size="large" color="#111" style={styles.loading} />
      ) : erro ? (
        <Text style={styles.aviso}>{erro}</Text>
      ) : (
        <FlatList
          data={produtos}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProductCard item={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.aviso}>Nenhuma novidade no momento.</Text>}
        />
      )}

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },

  title: {
    fontSize: 36,
    textAlign: 'center',
    marginVertical: 20,
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

  list: {
    paddingHorizontal: 10,
  },
});
