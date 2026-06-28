import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BottomMenu from '../components/BottomMenu';
import { useAuth } from '../context/AuthContext';
import { atualizarPerfil, obterPerfil } from '../services/userService';
import { extrairMensagemErro } from '../utils/erroApi';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { usuario, atualizarUsuario } = useAuth();

  const [nome, setNome] = useState(usuario?.nome || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [endereco, setEndereco] = useState(usuario?.endereco || '');
  const [salvando, setSalvando] = useState(false);

  // Carrega os dados atualizados do servidor ao abrir.
  useEffect(() => {
    (async () => {
      try {
        const dados = await obterPerfil();
        setNome(dados.nome || '');
        setEmail(dados.email || '');
        setEndereco(dados.endereco || '');
        atualizarUsuario(dados);
      } catch (e) {
        // Mantém o que já veio do contexto se a atualização falhar.
      }
    })();
  }, []);

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar vazio.');
      return;
    }

    // Envia só os campos que mudaram.
    const dados = {};
    if (nome.trim() !== (usuario?.nome || '')) dados.nome = nome.trim();
    if (endereco.trim() !== (usuario?.endereco || '')) dados.endereco = endereco.trim();

    if (Object.keys(dados).length === 0) {
      Alert.alert('Perfil', 'Nenhuma alteração para salvar.');
      return;
    }

    try {
      setSalvando(true);
      const atualizado = await atualizarPerfil(dados);
      atualizarUsuario(atualizado);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
    } catch (e) {
      Alert.alert('Erro', extrairMensagemErro(e, 'Não foi possível salvar o perfil.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={35} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Perfil</Text>

        <View style={{ width: 35 }} />
      </View>

      {/* CONTEÚDO */}
      <View style={styles.content}>
        <Text style={styles.title}>Perfil do usuário</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          style={styles.input}
          editable={true}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          style={styles.input}
          editable={false}
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          value={endereco}
          onChangeText={setEndereco}
          style={styles.input}
          editable={true}
        />

        <TouchableOpacity
          style={styles.passwordButton}
          onPress={salvar}
          disabled={salvando}
        >
          <Text style={styles.passwordButtonText}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.passwordButton}
          onPress={() => navigation.navigate('AlterarSenha')}
        >
          <Text style={styles.passwordButtonText}>
            Alterar senha
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.passwordButton}
          onPress={() =>
            navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          }
        >
          <Text style={styles.passwordButtonText}>
            Sair
          </Text>
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

  header: {
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },

  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 25,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },

  input: {
    backgroundColor: '#d9d9d9',
    height: 45,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#000',
  },

  passwordButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  passwordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
