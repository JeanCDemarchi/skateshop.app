import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HeaderMenu() {
  const navigation = useNavigation();

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={42} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.logo}>SKATESHOP</Text>

        <Ionicons name="search" size={38} color="#fff" />
      </View>

      <View style={styles.menu}>
        <TouchableOpacity onPress={() => navigation.navigate('Novidades')}>
          <Text style={styles.menuText}>Novidades</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Sobre')}>
          <Text style={styles.menuText}>Sobre</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Contato')}>
          <Text style={styles.menuText}>Contato</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1e1e1e',
    paddingTop: 55,
    paddingHorizontal: 28,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
});
