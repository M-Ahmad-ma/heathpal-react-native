import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { User, UserCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../types/navigation';
import { useAuth } from '../../../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AccountType'>;

export const AccountType = () => {
  const { setAccountType } = useAuth();
  const navigation = useNavigation<any>();

  const handleSelectType = (type: 'patient' | 'doctor') => {
    setAccountType(type);
    navigation.navigate('SignIn', { accountType: type });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8">
        {/* HealthPal Logo Section */}
        <View className="items-center mt-8 mb-10">
          <View className="mb-4">
            <View className="w-16 h-16 items-center justify-center">
              <View className="border-4 border-[#242E3E] w-10 h-10 absolute rounded-sm" />
              <View className="bg-white w-6 h-12 absolute" />
              <View className="bg-white w-12 h-6 absolute" />
              <View
                className="border-4 border-[#242E3E] w-10 h-10 rounded-sm"
                style={{ transform: [{ rotate: '45deg' }] }}
              />
            </View>
          </View>
          <Text className="text-2xl font-bold text-[#242E3E]">
            Health<Text className="font-light">Pal</Text>
          </Text>
        </View>

        {/* Header Text */}
        <View className="items-center mb-10">
          <Text className="text-2xl font-bold text-[#242E3E] ">
            Continue as
          </Text>
          <Text className="text-gray-400 text-base text-center">
            Select how you want to use HealthPal
          </Text>
        </View>

        {/* Account Type Options */}
        <View className="space-y-2">
          {/* Patient Option */}
          <TouchableOpacity
            onPress={() => handleSelectType('patient')}
            className="flex-row items-center p-5 border border-gray-200 rounded-2xl bg-gray-50/50"
            activeOpacity={0.8}
          >
            <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mr-4">
              <User size={28} color="black" fill="black" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#242E3E] mb-1">
                Patient
              </Text>
              <Text className="text-gray-400 text-sm">
                Book appointments and manage your health
              </Text>
            </View>
          </TouchableOpacity>

          {/* Doctor Option */}
          <TouchableOpacity
            onPress={() => handleSelectType('doctor')}
            className="flex-row items-center p-5 mt-2 border border-gray-200 rounded-2xl bg-gray-50/50"
            activeOpacity={0.8}
          >
            <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mr-4">
              <UserCheck size={28} color="black" fill="black" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#242E3E] mb-1">
                Doctor
              </Text>
              <Text className="text-gray-400 text-sm">
                Manage appointments and patients
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-auto pb-8 items-center">
          <Text className="text-gray-400 text-sm text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccountType;
