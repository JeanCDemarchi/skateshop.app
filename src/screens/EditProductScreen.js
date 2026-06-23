import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProductScreen({ route, navigation }) {
  const { produto, atualizarProduto } = route.params;

  const [name, setName] = useState(produto.name);
  const [price, setPrice] = useState(produto.price);
  const [stock, setStock] = useState(String(produto.stock));
  const [code, setCode] = useState(produto.code);
  

  function salvar() {
    const produtoEditado = {
        ...produto,
        name,
        price,
        stock,
        code,
    };

    atualizarProduto(produtoEditado);

    Alert.alert('Sucesso', 'Produto editado com sucesso!');
    navigation.goBack();
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar produto</Text>

      <Text>Nome</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text>Preço</Text>
      <TextInput value={price} onChangeText={setPrice} style={styles.input} />

      <Text>Estoque</Text>
      <TextInput value={stock} onChangeText={setStock} style={styles.input} keyboardType="numeric" />

      <Text>Código</Text>
      <TextInput value={code} onChangeText={setCode} style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={salvar}>
        <Text style={styles.buttonText}>Salvar alterações</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 25,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },

  label: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10,
    fontWeight: '500',
  },

  input: {
    backgroundColor: '#d9d9d9',
    height: 45,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#000',
  },

  button: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});