import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChangePasswordScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Alterar senha</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Nova senha</Text>

        <TextInput
          secureTextEntry
          style={styles.input}
        />

        <Text style={styles.label}>Confirme sua senha</Text>

        <TextInput
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={() => Alert.alert('Sucesso', 'Senha alterada com sucesso!')}
        >
          <Text style={styles.buttonText}>Salvar</Text>
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
    height:70,
    backgroundColor:'#1a1a1a',
    justifyContent:'center',
    alignItems:'center'
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