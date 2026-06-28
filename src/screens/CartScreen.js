import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';
import { useCart } from '../context/CartContext';
import { imagemPrincipal } from '../services/produtoService';
import { formatarPreco } from '../utils/formatarPreco';

export default function CartScreen({ navigation }) {
  const { itens, removerDoCarrinho, valorTotal } = useCart();

  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />

      <View style={styles.content}>
        <Text style={styles.title}>Carrinho</Text>

        {itens.length === 0 ? (
          <Text style={styles.aviso}>Seu carrinho está vazio.</Text>
        ) : (
          <>
            {itens.map(({ produto, quantidade }) => {
              const uri = imagemPrincipal(produto);
              return (
                <View style={styles.item} key={produto.id}>
                  <Image source={uri ? { uri } : undefined} style={styles.image} />
                  <View style={styles.info}>
                    <Text>{produto.nome}</Text>
                    <Text style={styles.qty}>{quantidade}</Text>
                  </View>
                  <View style={styles.right}>
                    <TouchableOpacity onPress={() => removerDoCarrinho(produto.id)}>
                      <Ionicons name="trash-outline" size={22} />
                    </TouchableOpacity>
                    <Text>R$ {formatarPreco(produto.precoAtual * quantidade)}</Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.totalBox}>
              <View style={styles.totalRow}>
                <Text>Total:</Text>
                <Text>R$ {formatarPreco(valorTotal)}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text>Frete:</Text>
                <Text>R$ 0,00</Text>
              </View>

              <View style={styles.totalRow}>
                <Text>Subtotal:</Text>
                <Text>R$ {formatarPreco(valorTotal)}</Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Checkout')}
              >
                <Text style={styles.buttonText}>Finalizar compra</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

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
    flex: 1,
    padding: 18,
  },

  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
  },

  aviso: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#555',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 45,
  },

  image: {
    width: 115,
    height: 115,
    resizeMode: 'contain',
  },

  info: {
    flex: 1,
    marginLeft: 15,
  },

  qty: {
    marginTop: 25,
    fontSize: 18,
  },

  right: {
    alignItems: 'flex-end',
    gap: 35,
  },

  totalBox: {
    borderTopWidth: 1,
    borderColor: '#000',
    paddingTop: 18,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  button: {
    backgroundColor: '#000',
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
  },

  bottom: {
    height: 60,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
