import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddProductScreen from '../screens/AddProductScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import EditProductScreen from '../screens/EditProductScreen';
import LoginScreen from '../screens/LoginScreen';
import OrdersScreen from '../screens/OrdersScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={RegisterScreen} />
        <Stack.Screen name="App" component={DrawerNavigator} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="EditarProduto" component={EditProductScreen} />
        <Stack.Screen name="AdicionarProduto" component={AddProductScreen} />
        <Stack.Screen name="AlterarSenha" component={ChangePasswordScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="PagamentoConfirmado" component={PaymentSuccessScreen} />
        <Stack.Screen name="Pedidos" component={OrdersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}