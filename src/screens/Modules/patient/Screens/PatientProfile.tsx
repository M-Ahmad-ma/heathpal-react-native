import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  LogOut,
  ChevronRight,
  Heart,
  Bell,
  Settings,
  HelpCircle,
  FileText,
  Edit,
} from 'lucide-react-native';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { api, handleApiCall } from '../../../../services/api';

// Skeleton Loader Component
const SkeletonLoader = ({
  width,
  height,
  className,
}: {
  width: number | string;
  height: number;
  className?: string;
}) => {
  return (
    <View className={`bg-gray-200 ${className}`} style={{ width, height }} />
  );
};

// Image with Skeleton Loader
const ImageWithSkeleton = ({
  uri,
  className,
  style,
}: {
  uri: string;
  className?: string;
  style?: any;
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={style}>
      {loading && (
        <SkeletonLoader
          width="100%"
          height={style?.height || 200}
          className={className}
        />
      )}
      <Image
        source={{ uri: uri || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400' }}
        className={className}
        style={[style, { opacity: loading ? 0 : 1 }]}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

export const PatientProfile = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch verified profile data from API
  const fetchProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      // Use helper to simplify error handling
      await handleApiCall(
        () => api.getMyProfile(),
        (data) => {
          if (data && data.data) {
            setProfileData(data.data);
          } else {
            // Fallback to user context if API response structure is unexpected
            setProfileData(user);
          }
        },
        (error) => {
          console.log('Error fetching profile:', error);
          setProfileData(user); // Fallback to auth user data
        }
      );
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const menuItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: Edit,
      onPress: () => {
        navigation.navigate('EditProfile');
      },
    },
    {
      id: '2',
      title: 'Favorites',
      icon: Heart,
      onPress: () => {
        navigation.navigate('Favorites');
      },
    },
    {
      id: '3',
      title: 'Notifications',
      icon: Bell,
      onPress: () => {
        // Open notification drawer via context or navigate
        console.log('Navigate to Notifications');
      },
    },
    {
      id: '4',
      title: 'Settings',
      icon: Settings,
      onPress: () => {
        console.log('Navigate to Settings');
      },
    },
    {
      id: '5',
      title: 'Help and Support',
      icon: HelpCircle,
      onPress: () => {
        console.log('Navigate to Help and Support');
      },
    },
    {
      id: '6',
      title: 'Terms and Conditions',
      icon: FileText,
      onPress: () => {
        console.log('Navigate to Terms and Conditions');
      },
    },
    {
      id: '7',
      title: 'Log Out',
      icon: LogOut,
      onPress: () => handleSignOut(),
      isLogout: true,
    },
  ];

  function handleSignOut() {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // AuthContext handles navigation on signOut via isAuthenticated state change
          }
        },
      ]
    );
  }

  // Use profileData or fallback to user context
  const displayUser = profileData || user || {};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchProfile(true)} />
        }
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-3">
          <Text className="text-xl font-semibold text-gray-900 text-center">
            Profile
          </Text>
        </View>

        {/* Profile Info Card */}
        <View className="items-center px-5 py-6">
          {/* Profile Image */}
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              <ImageWithSkeleton
                uri={displayUser.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
                style={{ width: 128, height: 128 }}
              />
            </View>
            {/* Edit Badge */}
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-10 h-10 bg-gray-900 rounded-full items-center justify-center border-4 border-white"
              onPress={() => console.log('Edit photo')}
            >
              <Edit size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text className="text-xl font-bold text-gray-900 mb-1">
            {displayUser.fullName || 'User Name'}
          </Text>

          {/* Phone */}
          <Text className="text-sm text-gray-500">
            {displayUser.phone || displayUser.email || 'No contact info'}
          </Text>
        </View>

        {/* Menu Items */}
        <View className="px-5">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              className={`flex-row items-center py-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
            >
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.isLogout ? 'bg-red-50' : 'bg-gray-50'
                  }`}
              >
                <item.icon
                  size={20}
                  color={item.isLogout ? '#EF4444' : '#6B7280'}
                />
              </View>

              <Text
                className={`flex-1 text-base ${item.isLogout
                  ? 'text-red-600 font-medium'
                  : 'text-gray-900 font-normal'
                  }`}
              >
                {item.title}
              </Text>

              {!item.isLogout && <ChevronRight size={20} color="#D1D5DB" />}
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};
