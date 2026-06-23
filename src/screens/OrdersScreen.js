import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';


const orders = [
  {
    id: '#58466',
    image: require('../assets/images/tool.png'),
  },
  {
    id: '#98761',
    image: require('../assets/images/lixa.png'),
  },
  {
    id: '#18958',
    image: require('../assets/images/bolts.png'),
  },
];

export default function OrdersScreen({navigation}) {
  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />

      

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.order}>
            <Image source={item.image} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.code}>{item.id}</Text>
              <Text style={styles.details}>1 ítem - R$</Text>

              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Rastrear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      
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
    fontSize: 22,
    marginBottom: 22,
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