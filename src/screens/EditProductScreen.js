import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { atualizarProduto } from '../services/produtoService';
import { extrairMensagemErro } from '../utils/erroApi';
import { assetParaArquivo, selecionarImagens } from '../utils/imagePicker';

function parsePreco(txt) {
  if (txt === '' || txt === null || txt === undefined) return NaN;
  let s = String(txt).replace(/[^0-9.,]/g, '');
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(',', '.');
  }
  return parseFloat(s);
}

export default function EditProductScreen({ route, navigation }) {
  const { produto } = route.params;

  const [name, setName] = useState(produto.nome ?? '');
  const [price, setPrice] = useState(String(produto.precoAtual ?? ''));
  const [stock, setStock] = useState(String(produto.estoqueAtual ?? ''));
  const [imagens, setImagens] = useState([]);
  const [salvando, setSalvando] = useState(false);

  async function escolherFotos() {
    const { assets, erro } = await selecionarImagens();
    if (erro) {
      Alert.alert('Atenção', erro);
      return;
    }
    if (assets.length > 0) setImagens(assets);
  }

  async function salvar() {
    // Monta apenas os campos alterados.
    const alterados = {};

    if (name.trim() !== (produto.nome ?? '')) {
      if (!name.trim()) {
        Alert.alert('Atenção', 'O nome não pode ficar vazio.');
        return;
      }
      alterados.nome = name.trim();
    }

    if (String(price) !== String(produto.precoAtual ?? '')) {
      const preco = parsePreco(price);
      if (!isFinite(preco) || preco <= 0) {
        Alert.alert('Atenção', 'Informe um preço válido (maior que 0).');
        return;
      }
      alterados.precoAtual = preco;
    }

    if (String(stock) !== String(produto.estoqueAtual ?? '')) {
      const estoque = parseInt(stock, 10);
      if (!Number.isInteger(estoque) || estoque < 0) {
        Alert.alert('Atenção', 'Informe um estoque válido (inteiro, 0 ou mais).');
        return;
      }
      alterados.estoqueAtual = estoque;
    }

    if (Object.keys(alterados).length === 0 && imagens.length === 0) {
      Alert.alert('Editar produto', 'Nenhuma alteração para salvar.');
      return;
    }

    try {
      setSalvando(true);

      if (imagens.length > 0) {
        // Com novas imagens: multipart.
        const form = new FormData();
        Object.entries(alterados).forEach(([k, v]) => form.append(k, String(v)));
        imagens.forEach((asset, i) => form.append('imagens', assetParaArquivo(asset, i)));
        await atualizarProduto(produto.id, form, true);
      } else {
        // Só campos de texto: JSON.
        await atualizarProduto(produto.id, alterados, false);
      }

      Alert.alert('Sucesso', 'Produto editado com sucesso!');
      navigation.goBack();
    } catch (e) {
      if (e?.response?.status === 404) {
        Alert.alert('Não encontrado', 'Este produto não existe mais.');
      } else {
        Alert.alert('Erro', extrairMensagemErro(e, 'Não foi possível editar o produto.'));
      }
    } finally {
      setSalvando(false);
    }
  }

  const textoFotos =
    imagens.length > 0 ? `${imagens.length} nova(s) foto(s)` : 'Adicionar novas fotos';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar produto</Text>

      <Text>Nome</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text>Preço</Text>
      <TextInput value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />

      <Text>Estoque</Text>
      <TextInput value={stock} onChangeText={setStock} style={styles.input} keyboardType="numeric" />

      <TouchableOpacity style={styles.photoBox} onPress={escolherFotos}>
        <Ionicons name="add-circle-outline" size={20} color="#008cff" />
        <Text style={styles.photoText}>{textoFotos}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={salvar} disabled={salvando}>
        <Text style={styles.buttonText}>
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </Text>
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

  photoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 45,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#008cff',
    borderRadius: 5,
    marginTop: 6,
  },

  photoText: {
    color: '#008cff',
    fontSize: 13,
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
