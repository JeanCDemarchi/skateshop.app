import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import BottomMenu from '../components/BottomMenu';
import { criarProduto } from '../services/produtoService';
import { extrairMensagemErro } from '../utils/erroApi';
import { assetParaArquivo, selecionarImagens } from '../utils/imagePicker';

// Converte "R$ 39,90" / "39,90" / "39.90" em número.
function parsePreco(txt) {
  if (!txt) return NaN;
  let s = String(txt).replace(/[^0-9.,]/g, '');
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(',', '.');
  }
  return parseFloat(s);
}

export default function AddProductScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [code, setCode] = useState('');
  const [destaque, setDestaque] = useState(false);
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

  async function salvarProduto() {
    const preco = parsePreco(price);
    const estoque = parseInt(stock, 10);

    if (!name.trim() || !description.trim()) {
      Alert.alert('Atenção', 'Preencha nome e descrição.');
      return;
    }
    if (!isFinite(preco) || preco <= 0) {
      Alert.alert('Atenção', 'Informe um preço válido (maior que 0).');
      return;
    }
    if (!Number.isInteger(estoque) || estoque < 0) {
      Alert.alert('Atenção', 'Informe um estoque válido (inteiro, 0 ou mais).');
      return;
    }
    if (imagens.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos uma imagem do produto.');
      return;
    }

    const form = new FormData();
    form.append('nome', name.trim());
    form.append('descricao', description.trim());
    form.append('precoAtual', String(preco));
    form.append('estoqueAtual', String(estoque));
    form.append('destaque', destaque ? 'true' : 'false');
    imagens.forEach((asset, i) => form.append('imagens', assetParaArquivo(asset, i)));

    try {
      setSalvando(true);
      await criarProduto(form);
      Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', extrairMensagemErro(e, 'Não foi possível adicionar o produto.'));
    } finally {
      setSalvando(false);
    }
  }

  const textoFotos =
    imagens.length > 0
      ? `${imagens.length} foto(s) selecionada(s)`
      : 'Selecione fotos do produto';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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

        <TouchableOpacity style={styles.photoBox} onPress={escolherFotos}>
          <Ionicons name="add-circle-outline" size={22} color="#008cff" />
          <Text style={styles.photoText}>{textoFotos}</Text>
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

        <TouchableOpacity
          style={styles.destaqueRow}
          onPress={() => setDestaque((v) => !v)}
        >
          <Ionicons
            name={destaque ? 'checkbox-outline' : 'square-outline'}
            size={22}
            color="#000"
          />
          <Text style={styles.destaqueText}>Produto em destaque</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={salvarProduto} disabled={salvando}>
          <Text style={styles.buttonText}>
            {salvando ? 'Salvando...' : 'Adicionar produto'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  content: {
    paddingHorizontal: 45,
    paddingTop: 25,
    paddingBottom: 40,
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

  destaqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },

  destaqueText: {
    fontSize: 14,
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
