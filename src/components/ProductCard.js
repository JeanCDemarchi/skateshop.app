import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import { useCart } from '../context/CartContext';
import { imagemPrincipal } from '../services/produtoService';
import { formatarPreco } from '../utils/formatarPreco';

export default function ProductCard({ item }) {
  const { adicionarAoCarrinho } = useCart();
  const uri = imagemPrincipal(item);

  function comprar() {
    adicionarAoCarrinho(item, 1);
    Alert.alert('Carrinho', `"${item.nome}" foi adicionado ao carrinho.`);
  }

  return (
    <View style={styles.card}>
      <Image source={uri ? { uri } : undefined} style={styles.image} />

      <Text style={styles.name}>{item.nome}</Text>

      <Text style={styles.price}>
        R$ {formatarPreco(item.precoAtual)}
      </Text>

      <TouchableOpacity style={styles.button} onPress={comprar}>
        <Text style={styles.buttonText}>Comprar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 20,
    alignItems: 'center',
  },

  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },

  name: {
    fontSize: 18,
    textAlign: 'center',
  },

  price: {
    fontWeight: 'bold',
    marginVertical: 5,
  },

  button: {
    marginTop: 5,
  },

  buttonText: {
    fontSize: 18,
  },
});