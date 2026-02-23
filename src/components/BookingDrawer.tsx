import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text } from 'react-native';
import { Hub } from '../screens/Modules/doctor/Hub';
import { Bookings } from '../screens/Modules/doctor/Bookings';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LogOut } from 'lucide-react-native';

export type HubDrawerParamList = {
  HubHome: undefined;
  HubBookings: undefined;
};

const Drawer = createDrawerNavigator<HubDrawerParamList>();

function CustomDrawerContent(props: any) {
  const { user, signOut, accountType } = useAuth();
  const navigation = useNavigation();

  const handleSignOut = () => {
    signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'AccountType' }],
    });
  };

  return (
    <DrawerContentScrollView {...props} className="flex-1 bg-white">
      <View className="px-4 py-6 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">DentalCare Pro</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {user?.email || 'User'}
        </Text>
        <Text className="text-xs text-[#009689] mt-1 uppercase">
          {accountType || 'Account'}
        </Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Sign Out"
        onPress={handleSignOut}
        icon={() => <LogOut size={22} color="#009689" />}
        labelStyle={{ color: '#009689', fontWeight: '600' }}
      />
    </DrawerContentScrollView>
  );
}

export const BookingDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerPosition: 'right',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: '100%',
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
      }}
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="HubHome"
        component={Hub}
        options={{ drawerLabel: 'Home' }}
      />
      <Drawer.Screen
        name="HubBookings"
        component={Bookings}
        options={{ drawerLabel: 'Bookings' }}
      />
    </Drawer.Navigator>
  );
};
