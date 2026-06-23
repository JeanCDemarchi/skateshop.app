import { createDrawerNavigator } from '@react-navigation/drawer';

import CartScreen from '../screens/CartScreen';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#111',
        },
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#aaa',
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Pedidos" component={OrdersScreen} />
      <Drawer.Screen name="Carrinho" component={CartScreen} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} />

      
    </Drawer.Navigator>
  );
}

