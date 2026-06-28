import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomMenu from '../components/BottomMenu';
import { useCart } from '../context/CartContext';
import { imagemPrincipal, obterProduto } from '../services/produtoService';
import { extrairMensagemErro } from '../utils/erroApi';
import { formatarPreco } from '../utils/formatarPreco';

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { adicionarAoCarrinho } = useCart();

  const [produto, setProduto] = useState(null);
  const [imagemAtual, setImagemAtual] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        setCarregando(true);
        setErro(null);
        const dados = await obterProduto(id);
        if (ativo) {
          setProduto(dados);
          setImagemAtual(imagemPrincipal(dados));
        }
      } catch (e) {
        if (ativo) {
          if (e?.response?.status === 404) {
            setErro('Produto não encontrado.');
          } else {
            setErro(extrairMensagemErro(e, 'Não foi possível carregar o produto.'));
          }
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [id]);

  function adicionar() {
    if (!produto) return;
    adicionarAoCarrinho(produto, 1);
    Alert.alert('Carrinho', `"${produto.nome}" foi adicionado ao carrinho.`);
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Detalhes</Text>
        <View style={{ width: 28 }} />
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#111" style={styles.loading} />
      ) : erro ? (
        <Text style={styles.aviso}>{erro}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Image
            source={imagemAtual ? { uri: imagemAtual } : undefined}
            style={styles.imagemPrincipal}
          />

          {produto.imagens?.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.galeria}
            >
              {produto.imagens.map((img) => (
                <TouchableOpacity key={img.id} onPress={() => setImagemAtual(img.url)}>
                  <Image
                    source={{ uri: img.url }}
                    style={[
                      styles.thumb,
                      imagemAtual === img.url && styles.thumbSelecionada,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.nome}>{produto.nome}</Text>
          <Text style={styles.preco}>R$ {formatarPreco(produto.precoAtual)}</Text>
          <Text style={styles.descricao}>{produto.descricao}</Text>

          <TouchableOpacity style={styles.botao} onPress={adicionar}>
            <Text style={styles.botaoTexto}>Adicionar ao carrinho</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },

  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
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

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  imagemPrincipal: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
    marginBottom: 12,
  },

  galeria: {
    marginBottom: 18,
  },

  thumb: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },

  thumbSelecionada: {
    borderColor: '#000',
    borderWidth: 2,
  },

  nome: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  preco: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
  },

  descricao: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 26,
  },

  botao: {
    backgroundColor: '#000',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
