import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';

export default function PaymentSuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Seu pagamento{'\n'}foi finalizado!</Text>

        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={45} color="#000" />
        </View>

        <Text style={styles.sectionTitle}>Produtos</Text>

        <View style={styles.productRow}>
          <Image
            source={require('../assets/images/tool.png')}
            style={styles.image}
          />

          <View>
            <Text>Chave em T PTN</Text>
            <Text>#58466</Text>
            <Text>1 item - R$</Text>
          </View>
        </View>

        <View style={styles.productRow}>
            <Image 
               source={require('../assets/images/shape.png')} 
               style={styles.image} 
            />
            <View>
              <Text>Shape 2 Face PTN</Text>
              <Text>#45632 </Text>
              <Text>1 item - R$</Text>
            </View>
        </View>    
        

        

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Pedidos')}
        >
          <Text style={styles.buttonText}>Rastrear</Text>
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

  content: {
    flex: 1,
    paddingHorizontal: 45,
    paddingTop: 35,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  checkCircle: {
    width: 75,
    height: 75,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 15,
  },

  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 80,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});