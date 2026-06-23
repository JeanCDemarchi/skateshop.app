import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';



export default function AdminHomeScreen({ navigation }) {
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Chave em T',
      price: '39,90',
      stock: 18,
      image: require('../assets/images/tool.png'),
    },
    {
      id: '2',
      name: 'Truck Gold',
      price: '499,90',
      stock: 7,
      image: require('../assets/images/truck.png'),
    },
    {
      id: '#98761',
      name: 'Lixa Emborrachada',
      price: '99,90',
      stock: 42,
      image: require('../assets/images/lixa.png'),
    },
    {
      id: '#18958',
      name: 'Parafuso Bolts',
      price: '24,90',
      stock: 63,
      image: require('../assets/images/bolts.png'),
    },
    {
      id: '#88654',
      name: 'Amortecedor PU',
      price: '49,90',
      stock: 25,
      image: require('../assets/images/amortecedor.png'),
    },
    {
      id: '#98898',
      name: 'Kit Parafusos',
      price: '39,90',
      stock: 31,
      image: require('../assets/images/paraf.png'),
    },
    {
      id: '#45632',
      name: 'Shape',
      price: '359,90',
      stock: 12,
      image: require('../assets/images/shape.png'),
    },
  ]);

  function adicionarProduto(novoProduto) {
    setProducts((listaAtual) => [...listaAtual, novoProduto]);
  }

  function atualizarProduto(produtoEditado) {
    setProducts((listaAtual) =>
        listaAtual.map((item) =>
        item.id === produtoEditado.id ? produtoEditado : item
        )
    );
  }

  function excluirProduto(id) {
    Alert.alert(
      'Excluir produto',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setProducts(products.filter((item) => item.id !== id));
          },
        },
      ]
    );
  }

  function editarProduto(produto) {
  navigation.navigate('EditarProduto', {
    produto,
    atualizarProduto,
  });
}

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} />

            <View style={styles.info}>
              <Text>{item.name}</Text>
              <Text>{item.code}</Text>
              <Text>{item.stock} unidades</Text>
              <Text>R$ {item.price}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => excluirProduto(item.id)}>
                <Ionicons name="trash-outline" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => editarProduto(item)}>
                <Ionicons name="pencil-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
        <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
            navigation.navigate('AdicionarProduto', {
            adicionarProduto,
            })
        }
        >
        <Ionicons name="add" size={38} color="#fff" />
      </TouchableOpacity>
      

      <BottomMenu />
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#000',
  },

  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginRight: 15,
  },

  info: {
    flex: 1,
  },

  actions: {
    gap: 18,
    alignItems: 'center',
  },
  addButton: {
  position: 'absolute',
  right: 20,
  bottom: 90,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#000',
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5,
  },
});