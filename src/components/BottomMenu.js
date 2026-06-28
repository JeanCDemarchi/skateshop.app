import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BottomMenu() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('App', { screen: 'Home' })}>
        <Ionicons name="home-outline" size={35} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('App', { screen: 'Pedidos' })}>
        <Ionicons name="notifications-outline" size={35} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('App', { screen: 'Carrinho' })}>
        <Ionicons name="cart-outline" size={35} color="#fff" />
      </TouchableOpacity>

    <TouchableOpacity onPress={() => navigation.navigate('App', { screen: 'Perfil' })}>
      <Ionicons name="person-outline" size={35} color="#fff" />
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});