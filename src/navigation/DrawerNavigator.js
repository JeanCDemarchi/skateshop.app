import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';

import CartScreen from '../screens/CartScreen';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const handleLogout = () =>
    props.navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Sair" labelStyle={{ color: '#aaa' }} onPress={handleLogout} />
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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

