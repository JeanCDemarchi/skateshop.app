import { ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';

export default function ContactScreen() {
  return (
    <View style={styles.container}>
      <HeaderMenu />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Contato</Text>

        <Text style={styles.text}>
          Entre em contato com a SkateShop para dúvidas, suporte ou informações
          sobre produtos e pedidos.
        </Text>

        <Text style={styles.subtitle}>E-mail</Text>
        <Text style={styles.text}>suporte@skateshop.com</Text>

        <Text style={styles.subtitle}>Telefone</Text>
        <Text style={styles.text}>(54) 99999-9999</Text>

        <Text style={styles.subtitle}>Endereço</Text>
        <Text style={styles.text}>
          Rua Cel. Chicuta, 79{"\n"}
          Passo Fundo - RS
        </Text>

        <Text style={styles.subtitle}>Horário de atendimento</Text>
        <Text style={styles.text}>
          Segunda a sexta{"\n"}
          08:00 às 18:00
        </Text>
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
    padding: 25,
    paddingBottom: 100,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
  },

  text: {
    fontSize: 18,
    lineHeight: 28,
    color: '#444',
  },
});
