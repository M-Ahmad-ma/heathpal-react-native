import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  FileText,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  Search,
  Bell,
  Heart,
  Star,
} from 'lucide-react-native';

import {
  Smile,
  HeartPulse,
  Wind,
  Stethoscope,
  Brain,
  Apple,
  FlaskConical,
  Syringe,
} from 'lucide-react-native';
import { useAuth } from '../../../../context/AuthContext';
import { usePatientUI } from '../Components/PatientUIContext';
import { useNavigation } from '@react-navigation/native';
import { api, handleApiCall } from '../../../../services/api';
import DentLogo from '../../../../../assets/svgs/dentist.svg';
import img1 from '../../../../../assets/doctors/img1.png';
import img2 from '../../../../../assets/doctors/img2.png';
import img3 from '../../../../../assets/doctors/img3.png';
import img4 from '../../../../../assets/doctors/img4.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 40;

// Skeleton Loader Component
const SkeletonLoader = ({
  width,
  height,
  className,
}: {
  width: number;
  height: number;
  className?: string;
}) => {
  return (
    <View className={`bg-gray-200 ${className}`} style={{ width, height }} />
  );
};

// Updated Image with Skeleton Loader that handles both require and uri
const ImageWithSkeleton = ({
  source,
  uri,
  className,
  style,
  resizeMode = 'cover',
}: {
  source?: ImageSourcePropType;
  uri?: string;
  className?: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}) => {
  const [loading, setLoading] = useState(true);
  const imageSource = source || (uri ? { uri } : undefined);

  return (
    <View style={style}>
      {loading && (
        <View
          className={`bg-gray-200 ${className}`}
          style={[{ width: '100%' }, style]}
        />
      )}
      {imageSource && (
        <Image
          source={imageSource}
          className={className}
          style={[style, { opacity: loading ? 0 : 1 }]}
          resizeMode={resizeMode}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={e => {
            console.log('Image failed to load:', e.nativeEvent.error);
            setLoading(false);
          }}
        />
      )}
    </View>
  );
};

const handleContactClinic = () => {
  Linking.openURL('tel:+1234567890');
};

export const PatientHome = () => {
  const { user } = useAuth();
  const { openDrawer, openNotificationDrawer, openAppointmentModal } =
    usePatientUI();
  const navigation = useNavigation<any>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [medicalCenters, setMedicalCenters] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [favoriteCenters, setFavoriteCenters] = useState<string[]>([]);

  function redirect(url: string) {
    navigation.navigate(url);
  }

  // Fetch user profile from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.getMyProfile();
        if (response?.data) {
          setUserProfile(response.data);
        }
      } catch (error) {
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch favorites and medical centers together
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch favorites first
        let favIds: string[] = [];
        try {
          const favResponse = await api.getFavorites({ type: 'medical_center' });
          if (favResponse?.data && Array.isArray(favResponse.data)) {
            favIds = favResponse.data.map((fav: any) => fav.centerId || fav.medicalCenterId || fav.id);
          }
        } catch (favError) {
        }
        setFavoriteCenters(favIds);

        // Fetch medical centers
        const centersResponse = await api.getMedicalCenters({
          type: 'Clinic',
          rating: '4',
          page: 1,
          limit: 10,
        });

        if (centersResponse?.data && Array.isArray(centersResponse.data)) {
          const mappedCenters = centersResponse.data.map((center: any) => ({
            id: center.id,
            name: center.name,
            image: center.image,
            type: center.type,
            address: center.address,
            rating: center.rating,
            reviewCount: center.review_count || 0,
            distance: '2.5 km',
            isFavorite: favIds.includes(center.id),
          }));
          setMedicalCenters(mappedCenters);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle favorite
  const toggleFavorite = async (centerId: string, e: any) => {
    e.stopPropagation();
    const isFavorite = favoriteCenters.includes(centerId);

    // Optimistic update
    setFavoriteCenters(prev =>
      isFavorite ? prev.filter(id => id !== centerId) : [...prev, centerId]
    );

    setMedicalCenters(prev =>
      prev.map(center =>
        center.id === centerId ? { ...center, isFavorite: !center.isFavorite } : center
      )
    );

    try {
      if (isFavorite) {
        await api.removeMedicalCenterFromFavorites(centerId);
      } else {
        await api.addMedicalCenterToFavorites(centerId);
      }
    } catch (error) {
      // Revert on error
      setFavoriteCenters(prev =>
        isFavorite ? [...prev, centerId] : prev.filter(id => id !== centerId)
      );
      setMedicalCenters(prev =>
        prev.map(center =>
          center.id === centerId ? { ...center, isFavorite: isFavorite } : center
        )
      );
    }
  };


  const Categories = [
    {
      id: '1',
      name: 'Dentist',
      icon: Smile,
      color: '#DC9497'
    },
    {
      id: '2',
      name: 'Cardiologist',
      icon: HeartPulse,
      color: '#93C19E'
    },
    {
      id: '3',
      name: 'Pulmonologist',
      icon: Wind,
      color: "#F5AD7E"
    },
    {
      id: '4',
      name: 'General Physician',
      icon: Stethoscope,
      color: "#ACA1CD"
    },
    {
      id: '5',
      name: 'Neurologist',
      icon: Brain,
      color: "#4D9B91"
    },
    {
      id: '6',
      name: 'Nutritionist',
      icon: Apple,
      color: "#352261"
    },
    {
      id: '7',
      name: 'Pathologist',
      icon: FlaskConical,
      color: "#DEB6B5"
    },
    {
      id: '8',
      name: 'Vaccination',
      icon: Syringe,
      color: "#89CCDB"
    },
  ];

  const Banners = [
    {
      image: require('../../../../../assets/doctors/img1.png'),
      title: 'Manage Appointments',
      description: 'View and organize daily patient bookings',
    },
    {
      image: require('../../../../../assets/doctors/img2.png'),
      title: 'Patient Records',
      description: 'Quick access to medical histories',
    },
    {
      image: require('../../../../../assets/doctors/img3.png'),
      title: 'Smart Consultations',
      description: 'Streamlined checkups and notes',
    },
    {
      image: require('../../../../../assets/doctors/img4.png'),
      title: 'Schedule Overview',
      description: 'Stay on top of your timetable',
    },
    {
      image: require('../../../../../assets/doctors/img5.png'),
      title: 'Critical Alerts',
      description: 'Never miss important updates',
    },
  ];



  useEffect(() => {
    setBanners(Banners);
    setCategories(Categories);

  }, []);

  const handleBannerScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / BANNER_WIDTH,
    );
    setActiveSlide(slideIndex);
  };


  const renderBanner = ({ item }: { item: (typeof banners)[0] }) => (
    <View
      className="rounded-xl overflow-hidden mr-5"
      style={{ width: BANNER_WIDTH, height: 192 }}
    >
      <View className="bg-teal-600 h-full relative">
        {/* Image */}
        <ImageWithSkeleton
          source={item.image}
          className="absolute right-0 top-0 w-full h-full bg-cover"
          style={{
            height: 192,
            transform: [
              { scale: 1.1 },
              { translateX: 15 },
            ],
          }}
        />

        <View
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
        />

        <View className="absolute p-6 flex-1 justify-center z-10 inset-0 max-w-[200px] w-full">
          <Text className="text-white text-2xl font-bold mb-2">
            {item.title}
          </Text>
          <Text className="text-white text-sm opacity-90">
            {item.description}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMedicalCenter = ({
    item,
  }: {
    item: (typeof medicalCenters)[0];
  }) => (


    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 mr-3"
      style={{ width: 220 }}
      onPress={() => {
        navigation.navigate('MedicalCenterDetails', { hospitalId: item.id });
      }}
    >
      <TouchableOpacity
        className="absolute right-3 top-2 z-30"
        onPress={(e) => {
          toggleFavorite(item.id, e);
        }}
      >
        <Heart
          color={item.isFavorite ? 'black' : 'white'}
          fill={item.isFavorite ? 'black' : 'none'}
          size={20}
        />
      </TouchableOpacity>

      <ImageWithSkeleton
        uri={item.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400'}
        className="w-full"
        style={{ height: 120 }}
      />

      {/* Text */}
      <View className="p-3">
        <Text className="text-sm font-semibold text-gray-900 mb-1">{item.name}</Text>
        <Text className="text-xs text-gray-500 mb-1">{item.type}</Text>
        <View className="flex-row items-center">
          <Star size={12} color="#FCD34D" fill="#FCD34D" />
          <Text className="text-xs text-gray-600 ml-1">{item.rating}</Text>
          <Text className="text-xs text-gray-400 ml-1">({item.reviewCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-3 pb-4">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={() => navigation.navigate('PatientProfile')}>
              <View className="flex-row items-center gap-3">
                <ImageWithSkeleton
                  uri={userProfile?.profileImage || user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                  className="w-10 h-10 rounded-full mr-3"
                  style={{ width: 40, height: 40 }}
                />
                <View>
                  <Text className="text-xs text-gray-500">Welcome back</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {userProfile?.fullName || user?.fullName || 'User'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openNotificationDrawer}
              className="relative"
            >
              <Bell size={24} color="#1F2937" />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-xs text-white font-bold">{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

        </View>

        {/* Hero Banner Carousel */}
        <View className="mb-6">
          <FlatList
            data={banners}
            renderItem={renderBanner}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_WIDTH + 20}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20 }}
            onScroll={handleBannerScroll}
            scrollEventThrottle={16}
          />

          {/* Pagination Dots */}
          <View className="flex-row justify-center gap-1 mt-4">
            {banners.map((_, index) => (
              <View
                key={index}
                className={`h-1 rounded-full ${index === activeSlide ? 'w-6 bg-teal-600' : 'w-1 bg-gray-300'}`}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View className="px-5 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Categories</Text>
            <TouchableOpacity onPress={() => redirect('PatientDoctors')}>
              <Text className="text-sm text-teal-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {categories.map(category => {
              return (
                <TouchableOpacity
                  key={category.id}
                  className="items-center"
                  style={{ width: '22%' }}
                >
                  <View
                    className="w-20 h-20 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon && <category.icon size={40} color="white" />}
                  </View>
                  <Text className="text-xs w-full text-gray-700 text-center">
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Nearby Medical Centers Slider */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4 px-5">
            <Text className="text-lg font-bold text-gray-900">
              Nearby Medical Centers
            </Text>
            <TouchableOpacity onPress={() => redirect('NearbyMedicalCenters')}>
              <Text className="text-sm text-teal-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={medicalCenters}
            renderItem={renderMedicalCenter}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
