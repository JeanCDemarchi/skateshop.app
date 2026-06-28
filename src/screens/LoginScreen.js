import { useState } from 'react';

import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!usuario.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha usuário e senha.');
      return;
    }
    try {
      setCarregando(true);
      const u = await login(usuario.trim(), senha);
      const destino = u.role === 'admin' ? 'AdminHome' : 'App';
      navigation.reset({ index: 0, routes: [{ name: destino }] });
    } catch (e) {
      Alert.alert('Erro ao entrar', e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.container}
      blurRadius={2}
    >
      <Text style={styles.logo}>SKATESHOP</Text>

      <TextInput
        placeholder="Digite seu usuário"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#555"
        style={styles.input}
      />

      <TextInput
        placeholder="Digite sua senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        placeholderTextColor="#555"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={entrar}
        disabled={carregando}
      >
        <Text style={styles.buttonText}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={styles.registerText}>
          Não possui conta? Cadastre-se aqui
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b1714',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  logo: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 70,
  },

  input: {
    width: '100%',
    backgroundColor: '#fff',
    height: 60,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#fff',
    width: '60%',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  buttonText: {
    fontSize: 24,
  },

  registerButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#000',
    width: '90%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },

  registerText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});