import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { alterarSenha } from '../services/userService';
import { extrairMensagemErro } from '../utils/erroApi';

export default function ChangePasswordScreen({ navigation }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!senhaAtual || !novaSenha || !confirmacaoNovaSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert('Atenção', 'A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmacaoNovaSenha) {
      Alert.alert('Atenção', 'A nova senha e a confirmação não conferem.');
      return;
    }

    try {
      setSalvando(true);
      await alterarSenha({ senhaAtual, novaSenha, confirmacaoNovaSenha });
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      navigation?.goBack();
    } catch (e) {
      // 401 = senha atual incorreta; 400 = validação.
      Alert.alert('Erro', extrairMensagemErro(e, 'Não foi possível alterar a senha.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Alterar senha</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Senha atual</Text>

        <TextInput
          secureTextEntry
          style={styles.input}
          value={senhaAtual}
          onChangeText={setSenhaAtual}
        />

        <Text style={styles.label}>Nova senha</Text>

        <TextInput
          secureTextEntry
          style={styles.input}
          value={novaSenha}
          onChangeText={setNovaSenha}
        />

        <Text style={styles.label}>Confirme sua senha</Text>

        <TextInput
          secureTextEntry
          style={styles.input}
          value={confirmacaoNovaSenha}
          onChangeText={setConfirmacaoNovaSenha}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={salvar}
          disabled={salvando}
        >
          <Text style={styles.buttonText}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#fff'
  },

  header:{
    backgroundColor:'#1a1a1a',
    justifyContent:'center',
    alignItems:'center',
    paddingTop:55,
    paddingBottom:28
  },

  headerText:{
    color:'#fff',
    fontSize:24,
    fontWeight:'bold'
  },

  content:{
    padding:30
  },

  label:{
    marginBottom:5
  },

  input:{
    backgroundColor:'#d9d9d9',
    height:40,
    marginBottom:15,
    paddingHorizontal:10
  },

  button:{
    backgroundColor:'#000',
    height:50,
    borderRadius:8,
    justifyContent:'center',
    alignItems:'center',
    marginTop:20
  },

  buttonText:{
    color:'#fff',
    fontSize:18,
    fontWeight:'bold'
  }
});
