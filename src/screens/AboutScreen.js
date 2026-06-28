import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import BottomMenu from '../components/BottomMenu';
import HeaderMenu from '../components/HeaderMenu';
import { obterSobre } from '../services/aboutService';

// Conteúdo de reserva caso a API esteja indisponível.
const FALLBACK = {
  titulo: 'Skateshop',
  descricao:
    'A Skateshop é uma loja especializada em skate, nascida da paixão pela ' +
    'cultura do skate. Trabalhamos com shapes, trucks, rodas, rolamentos e ' +
    'acessórios das melhores marcas.',
  destaques: [
    'Produtos selecionados das melhores marcas',
    'Entrega para todo o Brasil',
    'Atendimento especializado',
  ],
};

export default function AboutScreen({ navigation }) {
  const [sobre, setSobre] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const dados = await obterSobre();
        if (ativo) setSobre(dados);
      } catch (e) {
        // Se a API falhar, usa o conteúdo local para a tela não ficar vazia.
        if (ativo) setSobre(FALLBACK);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />

      {carregando ? (
        <ActivityIndicator size="large" color="#111" style={styles.loading} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.titulo}>{sobre.titulo}</Text>
          <Text style={styles.descricao}>{sobre.descricao}</Text>

          {sobre.destaques?.length > 0 && (
            <View style={styles.destaques}>
              {sobre.destaques.map((item, i) => (
                <Text key={i} style={styles.destaque}>{`•  ${item}`}</Text>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  loading: {
    marginTop: 40,
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  descricao: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 22,
  },

  destaques: {
    gap: 10,
  },

  destaque: {
    fontSize: 16,
    color: '#000',
  },
});
