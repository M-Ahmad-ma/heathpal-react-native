import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mail } from 'lucide-react-native';

export const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    // Logic remains unchanged
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Check Your Email',
        'We have sent password reset instructions to your email.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8">
        {/* Header / Back Button */}
        <View className="flex-row items-center py-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center border border-gray-100 rounded-full"
          >
            <ArrowLeft size={24} color="#1C2733" />
          </TouchableOpacity>
        </View>

        {/* HealthPal Logo Section */}
        <View className="items-center mt-4 mb-10">
          <View className="w-16 h-16 items-center justify-center mb-4">
            <View className="border-4 border-[#242E3E] w-10 h-10 absolute rounded-sm" />
            <View className="bg-white w-6 h-12 absolute" />
            <View className="bg-white w-12 h-6 absolute" />
            <View className="border-4 border-[#242E3E] w-10 h-10 rounded-sm" style={{ transform: [{ rotate: '45deg' }] }} />
          </View>
          <Text className="text-2xl font-bold text-[#242E3E]">
            Health<Text className="font-light">Pal</Text>
          </Text>
        </View>

        {/* Content Header */}
        <View className="items-center mb-10">
          <Text className="text-2xl font-bold text-[#242E3E] mb-2">
            Reset Password
          </Text>
          <Text className="text-base text-gray-400 text-center px-4">
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </View>

        {/* Input Field */}
        <View className="mb-8">
          <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50">
            <Mail size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-gray-700 text-base"
              placeholder="Your Email Address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Main Action Button */}
        <TouchableOpacity
          onPress={handleResetPassword}
          className="bg-[#1C2733] py-4 rounded-full items-center mb-8 shadow-sm"
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              Send Instructions
            </Text>
          )}
        </TouchableOpacity>

        {/* Back to Login Link */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="items-center mt-auto pb-10"
        >
          <Text className="text-gray-500 text-base">
            Remember your password?{' '}
            <Text className="text-blue-500 font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;
