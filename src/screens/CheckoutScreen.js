import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';

export default function CheckoutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />
      
      

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Ionicons
            name="arrow-back"
            size={36}
            color="#000"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Finalizar compra</Text>
        </View>

        <Text style={styles.section}>Identifique-se</Text>
        <TextInput placeholder="Nome:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="E-mail:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="CPF:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="Telefone:" placeholderTextColor="#000" style={styles.input} />

        <Text style={styles.section}>Entrega</Text>
        <TextInput placeholder="CEP:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="Endereço:" placeholderTextColor="#000" style={styles.input} />
        <TextInput placeholder="Número:" placeholderTextColor="#000" style={styles.input} />

        <Text style={styles.section}>Pagamento</Text>
        <TouchableOpacity style={styles.input}>
          <Text style={styles.inputText}>Cartão</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.input}>
          <Text style={styles.inputText}>PIX</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}
         onPress={() => navigation.navigate('PagamentoConfirmado')}
         >
          <Text style={styles.buttonText}>Ir para o pagamento</Text>
        </TouchableOpacity>
      </ScrollView>

      
      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  

  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  menu: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 12,
  },

  menuText: {
    color: '#fff',
    fontSize: 14,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  section: {
    fontSize: 20,
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#d8d6d6',
    height: 42,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    fontSize: 16,
    marginBottom: 8,
  },

  inputText: {
    fontSize: 16,
  },

  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 22,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
  },

  bottom: {
    height: 60,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});