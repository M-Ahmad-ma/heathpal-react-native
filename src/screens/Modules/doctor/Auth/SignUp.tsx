import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { User, Mail, Lock, Facebook } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../types/navigation';
import { useAuth } from '../../../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export const SignUp = ({ route }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signUp, isLoading, setAccountType } = useAuth();
  const navigation = useNavigation<Props['navigation']>();

  const routeAccountType = route.params?.accountType;

  React.useEffect(() => {
    if (routeAccountType) {
      setAccountType(routeAccountType);
    } else {
      setAccountType('patient');
    }
  }, [routeAccountType, setAccountType]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = (): boolean => {
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      isValid = false;
    } else if (fullName.trim().length < 2) {
      setFullNameError('Please enter your full name');
      isValid = false;
    } else {
      setFullNameError('');
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSignUp = async () => {
    setFullNameError('');
    setEmailError('');
    setPasswordError('');

    if (!validateInputs()) {
      return;
    }
    try {
      await signUp(email, password, fullName);
      // After successful signup, redirect to SignIn with pre-filled credentials
      navigation.replace('SignIn', {
        accountType: routeAccountType || 'patient',
        prefillEmail: email,
        prefillPassword: password,
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Error', error.message || 'Sign up failed');
    }
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn', {
      accountType: routeAccountType || 'patient',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-8 pt-12 pb-10">
            {/* Logo Section */}
            <View className="items-center mb-10">
              <View className="mb-4">
                {/* Recreating the HealthPal Logo Icon */}
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
            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-[#242E3E] mb-1">
                Create Account
              </Text>
              <Text className="text-gray-400 text-base">
                We are here to help you!
              </Text>
            </View>

            {/* Form Fields */}
            <View className="space-y-4 mb-6">
              <View>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-1 bg-gray-50/50">
                  <User size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-700 text-base"
                    placeholder="Your Name"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (fullNameError) setFullNameError('');
                    }}
                  />
                </View>
                {fullNameError ? (
                  <Text className="text-red-500 text-xs mt-1 ml-1">{fullNameError}</Text>
                ) : null}
              </View>

              <View>
                <View className="flex-row items-center border border-gray-200 mt-1 rounded-xl px-4 py-1 bg-gray-50/50">
                  <Mail size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-700 text-base"
                    placeholder="Your Email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                  />
                </View>
                {emailError ? (
                  <Text className="text-red-500 text-xs mt-1 ml-1">{emailError}</Text>
                ) : null}
              </View>

              <View>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-1 mt-1 bg-gray-50/50">
                  <Lock size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-700 text-base"
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                  />
                </View>
                {passwordError ? (
                  <Text className="text-red-500 text-xs mt-1 ml-1">{passwordError}</Text>
                ) : null}
              </View>
            </View>

            {/* Main Action Button */}
            <TouchableOpacity
              className="bg-[#1C2733] py-4 rounded-full items-center mb-6 shadow-sm"
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="mx-4 text-gray-400">or</Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            {/* Social Buttons */}
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 py-4 rounded-xl mb-2">
                <Image
                  source={{
                    uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
                  }}
                  className="w-5 h-5 mr-3"
                />
                <Text className="text-[#242E3E] font-medium text-base">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 py-4 rounded-xl">
                <Facebook
                  size={22}
                  color="#1877F2"
                  fill="#1877F2"
                  className="mr-3"
                />
                <Text className="text-[#242E3E] font-medium text-base ml-2">
                  Continue with Facebook
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer Link */}
            <View className="mt-auto pt-8 items-center">
              <Text className="text-gray-500 text-base">
                Do you have an account ?{' '}
                <Text
                  onPress={handleSignIn}
                  className="text-blue-500 font-bold"
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
