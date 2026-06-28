import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTATOS = [
  { icone: 'mail-outline', texto: 'contato@skateshop.com.br' },
  { icone: 'call-outline', texto: '(11) 99999-0000' },
  { icone: 'location-outline', texto: 'Rua dos Skatistas, 100 - São Paulo/SP' },
  { icone: 'logo-instagram', texto: '@skateshop' },
];

export default function ContactScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');

  function enviar() {
    if (!nome.trim() || !email.trim() || !mensagem.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Atenção', 'Informe um e-mail válido.');
      return;
    }

    // Não há endpoint de contato no backend — apenas confirmação local.
    Alert.alert('Mensagem enviada', 'Obrigado pelo contato! Responderemos em breve.');
    setNome('');
    setEmail('');
    setMensagem('');
  }

  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Fale com a gente</Text>

        <View style={styles.infoBox}>
          {CONTATOS.map((c, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name={c.icone} size={22} color="#000" />
              <Text style={styles.infoText}>{c.texto}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Envie uma mensagem</Text>

        <TextInput
          placeholder="Nome"
          placeholderTextColor="#777"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          placeholder="E-mail"
          placeholderTextColor="#777"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Mensagem"
          placeholderTextColor="#777"
          style={styles.textarea}
          value={mensagem}
          onChangeText={setMensagem}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={enviar}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
  },

  infoBox: {
    gap: 14,
    marginBottom: 28,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  infoText: {
    fontSize: 16,
    color: '#333',
  },

  section: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  input: {
    backgroundColor: '#d9d9d9',
    height: 45,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
    color: '#000',
  },

  textarea: {
    backgroundColor: '#d9d9d9',
    height: 110,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingTop: 10,
    marginBottom: 12,
    color: '#000',
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
