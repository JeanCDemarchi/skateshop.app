import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';
import ProductCard from '../components/ProductCard';

const products = [
  {
    id: '1',
    name: 'Chave em T',
    price: '39,90',
    image: require('../assets/images/tool.png'),
  },
  {
    id: '2',
    name: 'Truck Gold',
    price: '499,90',
    image: require('../assets/images/truck.png'),
  },
  
  {
    id: '#98761',
    price: '99,90',
    image: require('../assets/images/lixa.png'),
  },
  {
    id: '#18958',
    price: '24,90',
    image: require('../assets/images/bolts.png'),
  },
  {
    id: '#88654',
    price: '49,90',
    image: require('../assets/images/amortecedor.png'),
  },
  {
    id: '#98898',
    price: '39,90',
    image: require('../assets/images/paraf.png'),
  },
  {
    id: '#45632',
    name: 'Shape',
    price: '359,90',
    image: require('../assets/images/shape.png'),
  },

];

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />

      <Text style={styles.title}>Best Sellers</Text>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={styles.list}
      />

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
    backgroundColor: '#111',
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
  },

  logo: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 36,
    textAlign: 'center',
    marginVertical: 20,
  },

  list: {
    paddingHorizontal: 10,
  },
});