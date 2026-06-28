import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [cep, setCep] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Aceita CEP com ou sem traço; envia no formato 00000-000 que o backend exige.
  function normalizarCep(valor) {
    const d = (valor || '').replace(/\D/g, '');
    return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : (valor || '').trim();
  }

  async function criarConta() {
    // Validação rápida no front (o backend valida novamente).
    if (!username.trim() || !email.trim() || !senha || !confirmacaoSenha || !endereco.trim() || !cep.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (senha !== confirmacaoSenha) {
      Alert.alert('Atenção', 'A senha e a confirmação não conferem.');
      return;
    }

    const dados = {
      username: username.trim(),
      nome: username.trim(), // a tela não tem campo "nome"; usamos o username
      email: email.trim(),
      senha,
      confirmacaoSenha,
      endereco: numero.trim() ? `${endereco.trim()}, ${numero.trim()}` : endereco.trim(),
      cep: normalizarCep(cep),
    };

    try {
      setCarregando(true);
      await register(dados);
      Alert.alert('Sucesso', 'Conta criada! Faça login para continuar.');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Erro ao cadastrar', e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={32} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Cadastro</Text>

      <TextInput placeholder="User name" placeholderTextColor="#fff" style={styles.input}
        value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
      <TextInput placeholder="Endereço de e-mail" placeholderTextColor="#fff" style={styles.input}
        value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
      <TextInput placeholder="Senha" placeholderTextColor="#fff" secureTextEntry style={styles.input}
        value={senha} onChangeText={setSenha} />
      <TextInput placeholder="Confirme sua senha" placeholderTextColor="#fff" secureTextEntry style={styles.input}
        value={confirmacaoSenha} onChangeText={setConfirmacaoSenha} />

      <View style={styles.row}>
        <TextInput placeholder="Endereço" placeholderTextColor="#fff" style={styles.inputHalf}
          value={endereco} onChangeText={setEndereco} />
        <TextInput placeholder="Número" placeholderTextColor="#fff" style={styles.inputHalf}
          value={numero} onChangeText={setNumero} keyboardType="numeric" />
      </View>

      <TextInput placeholder="Cep" placeholderTextColor="#fff" style={styles.inputCep}
        value={cep} onChangeText={setCep} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={criarConta} disabled={carregando}>
        <Text style={styles.buttonText}>{carregando ? 'Criando...' : 'Criar conta'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    minHeight: '100%',
    paddingBottom: 60,
  },
  backButton: {
    position: 'absolute',
    top: 45,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 90,
  },
  input: {
    backgroundColor: '#000',
    color: '#fff',
    height: 65,
    borderRadius: 10,
    paddingHorizontal: 20,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 90,
  },
  inputHalf: {
    width: '48%',
    backgroundColor: '#000',
    color: '#fff',
    height: 65,
    borderRadius: 10,
    paddingHorizontal: 18,
    fontSize: 25,
    fontWeight: 'bold',
  },
  inputCep: {
    alignSelf: 'center',
    backgroundColor: '#000',
    color: '#fff',
    width: '42%',
    height: 65,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 55,
  },
  button: {
    backgroundColor: '#000',
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 65,
    width: '75%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
  },
});