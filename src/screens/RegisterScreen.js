import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function RegisterScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput placeholder="User name" placeholderTextColor="#fff" style={styles.input} />
      <TextInput placeholder="Endereço de e-mail" placeholderTextColor="#fff" style={styles.input} />
      <TextInput placeholder="Senha" placeholderTextColor="#fff" secureTextEntry style={styles.input} />
      <TextInput placeholder="Confirme sua senha" placeholderTextColor="#fff" secureTextEntry style={styles.input} />

      <View style={styles.row}>
        <TextInput placeholder="Endereço" placeholderTextColor="#fff" style={styles.inputHalf} />
        <TextInput placeholder="Número" placeholderTextColor="#fff" style={styles.inputHalf} />
      </View>

      <TextInput placeholder="Cep" placeholderTextColor="#fff" style={styles.inputCep} />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('App')}>
        <Text style={styles.buttonText}>Criar conta</Text>
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