import React, { useState, useEffect } from 'react';
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
import { Mail, Lock, Check } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../types/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { createMMKV } from 'react-native-mmkv';
import { DEFAULT_CREDENTIALS } from '../../../../constants/testCredentials';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

const storage = createMMKV();
const REMEMBER_ME_KEY = 'healthpal_remember_me';
const CREDENTIALS_KEY = 'healthpal_credentials';

export const SignIn = ({ route }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true);
  const { signIn, isLoading, setAccountType } = useAuth();
  const navigation = useNavigation<Props['navigation']>();

  const routeAccountType = route.params?.accountType;
  const prefillEmail = route.params?.prefillEmail;
  const prefillPassword = route.params?.prefillPassword;

  // Load saved credentials on mount
  useEffect(() => {
    const loadCredentials = () => {
      try {
        // Check if remember me was enabled
        const rememberMeEnabled = storage.getBoolean(REMEMBER_ME_KEY) || false;

        if (rememberMeEnabled) {
          // Load saved credentials
          const credentialsData = storage.getString(CREDENTIALS_KEY);
          if (credentialsData) {
            const { savedEmail, savedPassword, savedAccountType } = JSON.parse(credentialsData);
            setEmail(savedEmail || '');
            setPassword(savedPassword || '');
            setRememberMe(true);
            
            // Set account type from saved credentials
            if (savedAccountType) {
              setAccountType(savedAccountType);
            }
          }
        }
      } catch (error) {
        console.log('Error loading credentials:', error);
      } finally {
        setIsLoadingCredentials(false);
      }
    };

    loadCredentials();
  }, []);

  // Handle pre-filled credentials from signup
  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
    if (prefillPassword) {
      setPassword(prefillPassword);
    }
    if (routeAccountType) {
      setAccountType(routeAccountType);
    }
  }, [prefillEmail, prefillPassword, routeAccountType, setAccountType]);

  // Auto-fill default test credentials based on account type
  useEffect(() => {
    const autoFillCredentials = () => {
      const accountTypeToUse = routeAccountType || 'patient';
      const defaultCred = DEFAULT_CREDENTIALS[accountTypeToUse as 'doctor' | 'patient'];
      
      if (defaultCred && !email && !password) {
        setEmail(defaultCred.email);
        setPassword(defaultCred.password);
        setAccountType(defaultCred.accountType);
      }
    };
    
    autoFillCredentials();
  }, [routeAccountType]);

  // Also load saved credentials if no prefill data
  useEffect(() => {
    if (!prefillEmail && !prefillPassword) {
      const loadSavedCredentials = () => {
        try {
          const rememberMeEnabled = storage.getBoolean(REMEMBER_ME_KEY) || false;
          if (rememberMeEnabled) {
            const credentialsData = storage.getString(CREDENTIALS_KEY);
            if (credentialsData) {
              const { savedEmail, savedPassword } = JSON.parse(credentialsData);
              if (!email) setEmail(savedEmail || '');
              if (!password) setPassword(savedPassword || '');
              setRememberMe(true);
            }
          }
        } catch (error) {
          console.log('Error loading saved credentials:', error);
        }
      };
      loadSavedCredentials();
    }
  }, [prefillEmail, prefillPassword]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = (): boolean => {
    let isValid = true;

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

  const handleSignIn = async () => {
    setEmailError('');
    setPasswordError('');

    if (!validateInputs()) {
      return;
    }

    try {
      // Save or clear credentials based on remember me
      if (rememberMe) {
        storage.set(REMEMBER_ME_KEY, 'true');
        storage.set(CREDENTIALS_KEY, JSON.stringify({
          savedEmail: email,
          savedPassword: password,
          savedAccountType: routeAccountType || 'patient',
        }));
      } else {
        storage.remove(REMEMBER_ME_KEY);
        storage.remove(CREDENTIALS_KEY);
      }

      await signIn(email, password);
      // Navigation will be handled by RootNavigation based on auth state
      navigation.replace('AccountType');
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Error', error.message || 'Sign in failed');
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp', {
      accountType: routeAccountType || 'patient',
    });
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  if (isLoadingCredentials) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1C2733" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-8 pt-12 pb-10">
            {/* HealthPal Logo Section */}
            <View className="items-center mb-12">
              <View className="mb-4">
                {/* Visual representation of the logo in the screenshot */}
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
              <Text className="text-2xl font-bold text-[#242E3E] mb-1">
                Hi, Welcome Back
              </Text>
              <Text className="w-full text-center text-gray-400 text-base">
                Sign in to continue
              </Text>
            </View>

            {/* Input Fields */}
            <View className="space-y-4 mb-6">
              <View>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-1 bg-gray-50/50">
                  <Mail size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-700 text-base"
                    placeholder="Your Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {emailError ? (
                  <Text className="text-red-500 text-xs mt-1 ml-1">{emailError}</Text>
                ) : null}
              </View>

              <View>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-1 mt-3 bg-gray-50/50">
                  <Lock size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-700 text-base"
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError('');
                    }}
                    secureTextEntry
                  />
                </View>
                {passwordError ? (
                  <Text className="text-red-500 text-xs mt-1 ml-1">{passwordError}</Text>
                ) : null}
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  className={`w-5 h-5 border rounded mr-2 items-center justify-center
                  ${
                    rememberMe
                      ? 'bg-[#1C2733] border-[#1C2733]'
                      : 'border-gray-300'
                  }`}
                >
                  {rememberMe && <Check size={12} color="white" />}
                </View>
                <Text className="text-gray-500 text-sm">Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text className="text-blue-500 font-semibold text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              className="bg-[#1C2733] py-4 rounded-full items-center mb-8 shadow-sm"
              onPress={handleSignIn}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-8">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="mx-4 text-gray-400">or</Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            {/* Social Login Buttons (as seen in screenshot) */}
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 py-4 rounded-xl">
                <Image
                  source={{
                    uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
                  }}
                  style={{ width: 20, height: 20, marginRight: 12 }}
                />
                <Text className="text-[#242E3E] font-medium text-base">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 py-4 rounded-xl mt-3">
                <View className="bg-blue-600 rounded-full w-5 h-5 items-center justify-center mr-3">
                  <Text className="text-white font-bold text-xs">f</Text>
                </View>
                <Text className="text-[#242E3E] font-medium text-base">
                  Continue with Facebook
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-auto pt-10 items-center">
              <Text className="text-gray-500 text-base">
                Don't have an account?{' '}
                <Text
                  onPress={handleSignUp}
                  className="text-blue-500 font-bold"
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
