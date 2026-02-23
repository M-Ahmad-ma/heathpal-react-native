import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Calendar, Clock, LogOut } from 'lucide-react-native';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export const DoctorProfile = () => {
  const { user, signOut, accountType } = useAuth();
  const navigation = useNavigation<any>();

  const menuItems = [
    {
      id: '1',
      title: 'Personal Information',
      icon: User,
      subtitle: 'Update your details',
      onPress: () => {
        console.log('Navigate to Edit Personal Information');
      },
    },
    {
      id: '2',
      title: 'Schedule Settings',
      icon: Clock,
      subtitle: 'Manage your availability',
      onPress: () => {
        navigation.navigate('ScheduleSettings');
      },
    },
    {
      id: '3',
      title: 'Appointments',
      icon: Calendar,
      subtitle: 'View appointment history',
      onPress: () => {
        navigation.navigate('MainTabs', { screen: 'Bookings' });
      },
    },
  ];

  const handleSignOut = () => {
    signOut();
    // AuthContext handles navigation on signOut via isAuthenticated state change
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-black mb-8">Profile</Text>

        <View className="bg-gray-50 rounded-xl p-6 mb-6 items-center border border-gray-200">
          <View className="w-24 h-24 bg-gray-900 rounded-full items-center justify-center mb-4">
            <User size={44} color="white" strokeWidth={2} />
          </View>
          <Text className="text-xl font-bold text-black">
            {user?.fullName || 'Doctor'}
          </Text>
          <Text className="text-gray-500 text-sm">{user?.email}</Text>
          <View className="bg-gray-200 px-3 py-1 rounded-full mt-3">
            <Text className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              {accountType}
            </Text>
          </View>
        </View>

        <View className="bg-gray-50 rounded-xl border border-gray-200">
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center p-4 border-b border-gray-200 last:border-0 active:bg-gray-100"
              onPress={item.onPress}
            >
              <View className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center mr-3">
                <item.icon size={20} color="#000000" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-black">{item.title}</Text>
                <Text className="text-sm text-gray-500">{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center justify-center p-4 bg-black rounded-xl mt-6 active:bg-gray-900"
        >
          <LogOut size={20} color="white" strokeWidth={2} />
          <Text className="text-white font-bold ml-2">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DoctorProfile;

