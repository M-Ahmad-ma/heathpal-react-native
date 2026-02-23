import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Modal, TouchableWithoutFeedback } from 'react-native';
import { Home, Calendar, Users, User } from 'lucide-react-native';
import { PatientHome } from '../Screens/PatientHome';
import { PatientAppointments } from '../Screens/PatientAppointments';
import { PatientDoctors } from '../Screens/PatientDoctors';
import { PatientProfile } from '../Screens/PatientProfile';
import { DoctorSelectionDrawer } from '../Components/DoctorSelectionDrawer';
import { AppointmentDetailsModal } from '../Components/AppointmentDetailsModal';
import { DoctorDetailsDrawer } from '../Components/DoctorDetailsDrawer';
import { NotificationDrawer } from '../Components/NotificationDrawer';
import { usePatientUI } from '../Components/PatientUIContext';

export type PatientTabParamList = {
  PatientHome: undefined;
  PatientAppointments: undefined;
  PatientDoctors: undefined;
  PatientProfile: undefined;
};

const Tab = createBottomTabNavigator<PatientTabParamList>();

const PatientTabsContent = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'PatientHome') {
            return <Home color={color} size={size} />;
          }
          if (route.name === 'PatientAppointments') {
            return <Calendar color={color} size={size} />;
          }
          if (route.name === 'PatientDoctors') {
            return <Users color={color} size={size} />;
          }
          if (route.name === 'PatientProfile') {
            return <User color={color} size={size} />;
          }
          return <Text>?</Text>;
        },
        tabBarLabel: ({ color }) => {
          const labels: Record<string, string> = {
            PatientHome: 'Home',
            PatientAppointments: 'Appts',
            PatientDoctors: 'Doctors',
            PatientProfile: 'Profile',
          };
          return (
            <Text className="text-xs font-medium mb-1" style={{ color }}>
              {labels[route.name] || route.name}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="PatientHome" component={PatientHome} />
      <Tab.Screen name="PatientAppointments" component={PatientAppointments} />
      <Tab.Screen name="PatientDoctors" component={PatientDoctors} />
      <Tab.Screen name="PatientProfile" component={PatientProfile} />
    </Tab.Navigator>
  );
};

export const PatientTabNavigator = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    isNotificationDrawerOpen,
    closeNotificationDrawer,
  } = usePatientUI();

  return (
    <View className="flex-1">
      <PatientTabsContent />
      <AppointmentDetailsModal />
      <NotificationDrawer />

      <Modal
        visible={isDrawerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDrawer}
      >
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View className="flex-1 bg-black/30">
            <TouchableWithoutFeedback>
              <View className="absolute right-0 top-0 bottom-0 bg-white w-full h-full">
                <DoctorSelectionDrawer />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={isNotificationDrawerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeNotificationDrawer}
      >
        <TouchableWithoutFeedback onPress={closeNotificationDrawer}>
          <View className="flex-1 bg-black/30">
            <TouchableWithoutFeedback>
              <View className="absolute right-0 top-0 bottom-0 bg-white w-full h-full">
                <NotificationDrawer />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
