import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomMenu from '../components/BottomMenu';

export default function AddProductScreen({ route, navigation }) {
  const { adicionarProduto } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [code, setCode] = useState('');

  function salvarProduto() {
    const novoProduto = {
      id: Date.now().toString(),
      name,
      description,
      price,
      stock,
      code,
      image: require('../assets/images/tool.png'),
    };

    adicionarProduto(novoProduto);

    Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Nome e descrição</Text>

        <TextInput
          placeholder="Nome"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
          style={styles.description}
          multiline
        />

        <Text style={styles.label}>Fotos</Text>

        <TouchableOpacity style={styles.photoBox}>
          <Ionicons name="add-circle-outline" size={22} color="#008cff" />
          <Text style={styles.photoText}>Selecione fotos do produto</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Preço</Text>
        <TextInput
          placeholder="R$ 0,00"
          value={price}
          onChangeText={setPrice}
          style={styles.input}
        />

        <Text style={styles.label}>Estoque</Text>
        <TextInput
          placeholder="0"
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Códigos</Text>
        <TextInput
          placeholder="SKU"
          value={code}
          onChangeText={setCode}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={salvarProduto}>
          <Text style={styles.buttonText}>Adicionar produto</Text>
        </TouchableOpacity>
      </View>

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  content: {
    flex: 1,
    paddingHorizontal: 45,
    paddingTop: 25,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    marginBottom: 5,
    marginTop: 8,
  },

  input: {
    backgroundColor: '#d9d9d9',
    height: 35,
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  description: {
    backgroundColor: '#d9d9d9',
    height: 85,
    paddingHorizontal: 10,
    paddingTop: 8,
    marginBottom: 8,
    textAlignVertical: 'top',
  },

  photoBox: {
    height: 70,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#008cff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  photoText: {
    color: '#008cff',
    fontSize: 12,
    marginTop: 4,
  },

  button: {
    backgroundColor: '#000',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});