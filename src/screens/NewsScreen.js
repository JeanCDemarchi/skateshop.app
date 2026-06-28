import { Ionicons } from '@expo/vector-icons';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';

const novidades = [
  {
    id: '1',
    titulo: 'Novo Shape Petunia',
    descricao: 'Shape resistente com estampa exclusiva.',
    preco: 'R$ 359,90',
    image: require('../assets/images/shape.png'),
  },
  {
    id: '2',
    titulo: 'Truck Gold',
    descricao: 'Novo truck dourado para melhor desempenho.',
    preco: 'R$ 499,90',
    image: require('../assets/images/truck.png'),
  },
  {
    id: '3',
    titulo: 'Kit Bolts',
    descricao: 'Parafusos coloridos para personalizar seu skate.',
    preco: 'R$ 24,90',
    image: require('../assets/images/bolts.png'),
  },
];

export default function NewsScreen({ navigation }) {
      return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={38} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.logo}>SKATESHOP</Text>

        <Ionicons name="search" size={36} color="#fff" />
      </View>

      <View style={styles.menu}>
        <Text style={styles.menuActive}>Novidades</Text>
        <Text style={styles.menuText}>Sobre</Text>
        <Text style={styles.menuText}>Contato</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Novidades</Text>

        <FlatList
          data={novidades}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} />

              <View style={styles.info}>
                <Text style={styles.productTitle}>{item.titulo}</Text>
                <Text style={styles.description}>{item.descricao}</Text>
                <Text style={styles.price}>{item.preco}</Text>

                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Comprar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#1e1e1e',
    paddingTop: 50,
    paddingHorizontal: 25,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    color: '#fff',
    fontSize: 30,
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
    fontSize: 22,
  },

  menuActive: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  content: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    alignItems: 'center',
  },

  image: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginRight: 15,
  },

  info: {
    flex: 1,
  },

  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  description: {
    fontSize: 13,
    marginVertical: 5,
  },

  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  button: {
    backgroundColor: '#000',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    width: 110,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
});
