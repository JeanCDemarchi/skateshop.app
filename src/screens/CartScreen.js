import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';

export default function CartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />

      

      <View style={styles.content}>
        <Text style={styles.title}>Carrinho Petunia Boards</Text>

        <View style={styles.item}>
          <Image source={require('../assets/images/tool.png')} style={styles.image} />
          <View style={styles.info}>
            <Text>Chave em T PTN</Text>
            <Text style={styles.qty}>1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons name="trash-outline" size={22} />
            <Text>R$ 39,90</Text>
          </View>
        </View>

        <View style={styles.item}>
          <Image source={require('../assets/images/shape.png')} style={styles.image} />
          <View style={styles.info}>
            <Text>Shape 2 Face PTN</Text>
            <Text style={styles.qty}>1</Text>
          </View>
          <View style={styles.right}>
            <Ionicons name="trash-outline" size={22} />
            <Text>R$ 359,90</Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text>Total:</Text>
            <Text>R$ 399,29</Text>
          </View>

          <View style={styles.totalRow}>
            <Text>Frete:</Text>
            <Text>R$ 30,00</Text>
          </View>

          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>R$ 439,29</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.buttonText}>Finalizar compra</Text>
          </TouchableOpacity>
        </View>
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