import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomMenu from '../components/BottomMenu';
import ProductCard from '../components/ProductCard';
import { buscarProdutos } from '../services/produtoService';

export default function SearchScreen({ navigation }) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [buscou, setBuscou] = useState(false);

  // Busca com debounce (350ms). Termo vazio não chama a API.
  useEffect(() => {
    const q = termo.trim();
    if (!q) {
      setResultados([]);
      setBuscou(false);
      setCarregando(false);
      return;
    }

    let ativo = true;
    setCarregando(true);

    const timer = setTimeout(async () => {
      try {
        const dados = await buscarProdutos(q);
        if (ativo) {
          setResultados(dados);
          setBuscou(true);
        }
      } catch (e) {
        if (ativo) {
          setResultados([]);
          setBuscou(true);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }, 350);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [termo]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Buscar produtos..."
          placeholderTextColor="#888"
          value={termo}
          onChangeText={setTermo}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#111" style={styles.loading} />
      ) : (
        <FlatList
          data={resultados}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProductCard item={item} />}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.aviso}>
              {termo.trim() === ''
                ? 'Digite para buscar produtos.'
                : buscou
                ? 'Nenhum produto encontrado.'
                : ''}
            </Text>
          }
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

  header: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },

  input: {
    flex: 1,
    backgroundColor: '#fff',
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#000',
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
    paddingTop: 16,
  },
});
