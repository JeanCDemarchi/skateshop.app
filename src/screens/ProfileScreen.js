import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomMenu from '../components/BottomMenu';

export default function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={35} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Perfil</Text>

        <View style={{ width: 35 }} />
      </View>

      {/* CONTEÚDO */}
      <View style={styles.content}>
        <Text style={styles.title}>Perfil do usuário</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          value="Nome"
          style={styles.input}
          editable={true}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value="Email"
          style={styles.input}
          editable={false}
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          value="Endereço"
          style={styles.input}
          editable={true}
        />

        <TouchableOpacity
          style={styles.passwordButton}
          onPress={() => navigation.navigate('AlterarSenha')}
        >
          <Text style={styles.passwordButtonText}>
            Alterar senha
          </Text>
        </TouchableOpacity>
      </View>

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    height: 70,
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 25,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },

  input: {
    backgroundColor: '#d9d9d9',
    height: 45,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#000',
  },

  passwordButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  passwordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
