import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductCard({ item }) {
  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />

      <Text style={styles.name}>{item.name}</Text>

      <Text style={styles.price}>
        R$ {item.price}
      </Text>

      <TouchableOpacity style={styles.button}>
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