import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import AddProductScreen from '../screens/AddProductScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import EditProductScreen from '../screens/EditProductScreen';
import LoginScreen from '../screens/LoginScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { usuario, carregando } = useAuth();

  // Enquanto restaura a sessão salva, mostra um loading (evita "piscar" o login).
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1b1714' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Se já houver sessão restaurada, abre direto na área logada (admin ou cliente).
  const rotaInicial = usuario ? (usuario.role === 'admin' ? 'AdminHome' : 'App') : 'Login';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={rotaInicial} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={RegisterScreen} />
        <Stack.Screen name="App" component={DrawerNavigator} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="EditarProduto" component={EditProductScreen} />
        <Stack.Screen name="AdicionarProduto" component={AddProductScreen} />
        <Stack.Screen name="AlterarSenha" component={ChangePasswordScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="PagamentoConfirmado" component={PaymentSuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}