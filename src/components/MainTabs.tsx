import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Calendar, Stethoscope, User } from 'lucide-react-native';

// Screens
import { Bookings } from '../screens/Modules/doctor/Bookings';
import { DoctorProfile } from '../screens/Modules/doctor/Screens/DoctorProfile';

import { BookingDrawer } from './BookingDrawer';

// Types
import { TabParamList } from '../types/navigation';
import { PatientDrawer } from './PatientDrawer';

const Tab = createBottomTabNavigator<TabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Hub') {
            return <Stethoscope color={color} size={size} />;
          }
          if (route.name === 'Bookings') {
            return <Calendar color={color} size={size} />;
          }
          if (route.name === 'Patients') {
            return <User color={color} size={size} />;
          }
          if (route.name === 'Profile') {
            return <User color={color} size={size} />;
          }
          return <Text>?</Text>;
        },
      })}
    >
      <Tab.Screen name="Hub" component={BookingDrawer} />
      <Tab.Screen name="Bookings" component={Bookings} />
      <Tab.Screen name="Patients" component={PatientDrawer} />
      <Tab.Screen name="Profile" component={DoctorProfile} />
    </Tab.Navigator>
  );
}
