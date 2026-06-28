import { DrawerActions } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HeaderMenu({ navigation }) {
  const openMenu = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu}>
          <Ionicons name="menu" size={42} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.logo}>SKATESHOP</Text>
        <Ionicons name="search" size={38} color="#fff" />
      </View>

      <View style={styles.menu}>
        <Text style={styles.menuText}>Novidades</Text>
        <Text style={styles.menuText}>Sobre</Text>
        <Text style={styles.menuText}>Contato</Text>
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