import { ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';



export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <HeaderMenu />



      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Sobre</Text>

        <Text style={styles.text}>
          O SkateShop é um aplicativo desenvolvido para facilitar a compra de
          produtos voltados ao universo do skate.
        </Text>

        <Text style={styles.subtitle}>Objetivo</Text>

        <Text style={styles.text}>
          O projeto foi desenvolvido como atividade acadêmica e resolvemos prosseguir com ele após a faculdade pois gostamos do resultado.
        </Text>

        <Text style={styles.subtitle}>Versão</Text>

        <Text style={styles.text}>
          SkateShop{"\n"}
          Versão 1.0.0
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
