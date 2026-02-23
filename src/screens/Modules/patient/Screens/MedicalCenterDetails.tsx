
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  Clock,
  Phone,
  Globe,
  Mail,
  ChevronRight,
  Navigation,
} from 'lucide-react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import { api, handleApiCall } from '../../../../services/api.ts';
import { usePatientUI } from '../Components/PatientUIContext';

interface Hospital {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  distance: string;
  type: 'Hospital' | 'Clinic';
  image: string;
  isFavorite: boolean;
  about: string;
  phone: string;
  email: string;
  website: string;
  openingHours: string;
  services: string[];
}

interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  rating: number;
  profileImage: string;
  bio?: string;
  experience?: string;
  location?: string;
  reviewCount?: number;
  reviews?: string;
}

export const MedicalCenterDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hospitalId } = route.params as { hospitalId: string };
  const { openDoctorDrawer, closeDoctorDrawer, isDoctorDrawerOpen } = usePatientUI();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    loadMedicalCenterDetails();
  }, [hospitalId]);

  // Close doctor drawer when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        closeDoctorDrawer();
      };
    }, [])
  );

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isDoctorDrawerOpen) {
        closeDoctorDrawer();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isDoctorDrawerOpen]);

  const handleBackPress = () => {
    if (isDoctorDrawerOpen) {
      closeDoctorDrawer();
    } else {
      navigation.goBack();
    }
  };

  const loadMedicalCenterDetails = async () => {
    setLoading(true);

    await handleApiCall(
      async () => {
        const [centerRes, favoriteRes, doctorsRes] = await Promise.all([
          api.getMedicalCenterById(hospitalId),
          api.checkMedicalCenterIsFavorite(hospitalId),
          api.getDoctors({ page: 1, limit: 5 }),
        ]);

        return { centerRes, favoriteRes, doctorsRes };
      },
      ({ centerRes, favoriteRes, doctorsRes }) => {
        const center = centerRes.data;

        setHospital({
          id: center.id,
          name: center.name,
          address: center.address,
          rating: center.rating || 0,
          reviewCount: center.review_count || 0,
          distance: '2.5 km',
          type: center.type || 'Clinic',
          image: center.image || 'https://example.com/placeholder.jpg',
          isFavorite: favoriteRes.data.isFavorite,
          about: center.about || 'No description available',
          phone: center.phone || 'N/A',
          email: center.email || 'N/A',
          website: center.website || 'N/A',
          openingHours: center.opening_hours || 'Not specified',
          services: center.services || [],
        });

        setIsFavorite(favoriteRes.data.isFavorite);
        
        if (doctorsRes?.data && Array.isArray(doctorsRes.data) && doctorsRes.data.length > 0) {
          const mappedDoctors: Doctor[] = doctorsRes.data.map((doc: any) => ({
            id: doc.id,
            fullName: doc.fullName || doc.name || 'Unknown Doctor',
            specialty: doc.specialty || 'General',
            rating: doc.rating || 0,
            profileImage: doc.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
            bio: doc.bio || '',
            experience: doc.experience || 'N/A',
            location: center.name || 'Medical Center',
            reviewCount: doc.reviewCount || 0,
            reviews: `${doc.reviewCount || 0} Reviews`,
          }));
          setDoctors(mappedDoctors);
        } else {
          // Fallback test data for development
          setDoctors([
            {
              id: 'test-doc-1',
              fullName: 'Dr. John Smith',
              specialty: 'Cardiologist',
              rating: 4.8,
              profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
              bio: 'Experienced cardiologist with 15 years of practice.',
              experience: '15 years',
              location: center.name || 'Medical Center',
              reviewCount: 124,
              reviews: '124 Reviews',
            },
            {
              id: 'test-doc-2',
              fullName: 'Dr. Sarah Johnson',
              specialty: 'Dermatologist',
              rating: 4.6,
              profileImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
              bio: 'Board-certified dermatologist specializing in skin care.',
              experience: '10 years',
              location: center.name || 'Medical Center',
              reviewCount: 89,
              reviews: '89 Reviews',
            },
            {
              id: 'test-doc-3',
              fullName: 'Dr. Michael Brown',
              specialty: 'General Physician',
              rating: 4.5,
              profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200',
              bio: 'Compassionate general physician for all your health needs.',
              experience: '12 years',
              location: center.name || 'Medical Center',
              reviewCount: 156,
              reviews: '156 Reviews',
            },
          ]);
        }
      },
    );

    setLoading(false);
  };

  const handleToggleFavorite = async () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    await handleApiCall(
      () =>
        nextState
          ? api.addMedicalCenterToFavorites(hospitalId)
          : api.removeMedicalCenterFromFavorites(hospitalId),
      undefined,
      () => setIsFavorite(!nextState),
    );
  };

  if (loading || !hospital) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text>Loading medical center details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="relative">
          <View className="h-72 w-full">
            <Image
              source={{ uri: hospital.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800' }}
              className="w-full h-72"
              resizeMode="cover"
            />
          </View>
          <View className="absolute top-12 left-5">
            <TouchableOpacity
              onPress={handleBackPress}
              className="w-10 h-10 bg-white rounded-full items-center justify-center"
            >
              <ArrowLeft size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>
          <View className="absolute top-12 right-5">
            <TouchableOpacity
              onPress={handleToggleFavorite}
              className="w-10 h-10 bg-white rounded-full items-center justify-center"
            >
              <Heart
                size={20}
                color={isFavorite ? '#000' : '#9CA3AF'}
                fill={isFavorite ? '#000' : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 -mt-8 relative">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xl font-bold text-gray-900 flex-1">
                {hospital.name}
              </Text>
              <View className="bg-gray-100 px-3 py-1 rounded-full ml-2">
                <Text className="text-xs font-medium text-gray-600">
                  {hospital.type}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-3">
              <View className="flex-row items-center mr-4">
                <Star size={16} color="#FCD34D" fill="#FCD34D" />
                <Text className="text-sm font-semibold text-gray-900 ml-1">
                  {hospital.rating}
                </Text>
              </View>
              <Text className="text-sm text-gray-500">({hospital.reviewCount} reviews)</Text>
            </View>

            <View className="flex-row items-center mb-2">
              <MapPin size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2 flex-1">
                {hospital.address}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Navigation size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">
                {hospital.distance}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-5">
          <Text className="text-lg font-bold text-gray-900 mb-3">About</Text>
          <Text className="text-sm text-gray-600 leading-6">
            {hospital.about}
          </Text>
        </View>

        <View className="px-5 mt-5">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Opening Hours
          </Text>
          <View className="bg-gray-100 rounded-xl p-4 flex-row items-center">
            <Clock size={20} color="#6B7280" />
            <Text className="text-sm text-gray-700 ml-3 flex-1">
              {hospital.openingHours}
            </Text>
          </View>
        </View>

        <View className="px-5 mt-5">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Services
          </Text>
          <View className="bg-white rounded-2xl border border-gray-200 p-4">
            {hospital.services.map((service, index) => (
              <View
                key={index}
                className="flex-row items-center py-2 border-b border-gray-100"
              >
                <View className="w-2 h-2 bg-black rounded-full mr-3" />
                <Text className="text-sm text-gray-700">{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {doctors.length > 0 && (
          <View className="px-5 mt-5">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Our Doctors
            </Text>
            <FlatList
              data={doctors}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const hospitalName = hospital?.name || 'Medical Center';
                return (
                <TouchableOpacity
                  className="mr-4"
                  onPress={() => {
                    openDoctorDrawer({
                      id: item.id,
                      name: item.fullName,
                      specialty: item.specialty,
                      rating: item.rating,
                      experience: item.experience || 'N/A',
                      location: item.location || hospitalName,
                      image: item.profileImage,
                      bio: item.bio || '',
                      education: [],
                      services: [],
                      availability: [],
                      available: true,
                      reviews: item.reviews || '0 Reviews',
                      reviewsArray: [],
                    });
                  }}
                >
                  <View className="bg-white rounded-2xl p-3 border border-gray-200 w-32">
                    <View className="w-20 h-20 rounded-full overflow-hidden mb-2 self-center">
                      <Image
                        source={{ uri: item.profileImage }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <Text
                      className="text-xs font-bold text-gray-900 text-center"
                      numberOfLines={1}
                    >
                      {item.fullName}
                    </Text>
                    <Text className="text-xs text-gray-500 text-center">
                      {item.specialty}
                    </Text>
                    <View className="flex-row items-center justify-center mt-1">
                      <Star size={10} color="#FCD34D" fill="#FCD34D" />
                      <Text className="text-xs text-gray-600 ml-1">
                        {item.rating}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        <View className="px-5 mt-5">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Contact Information
          </Text>
          <View className="bg-white rounded-2xl border border-gray-200 p-4">
            <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
              <Phone size={20} color="#6B7280" />
              <Text className="text-sm text-gray-700 ml-3 flex-1">
                {hospital.phone}
              </Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
              <Mail size={20} color="#6B7280" />
              <Text className="text-sm text-gray-700 ml-3 flex-1">
                {hospital.email}
              </Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3">
              <Globe size={20} color="#6B7280" />
              <Text className="text-sm text-gray-700 ml-3 flex-1">
                {hospital.website}
              </Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 mt-5 pb-8">
          <Text className="text-lg font-bold text-gray-900 mb-3">Location</Text>
          <View className="bg-gray-200 rounded-2xl h-48 items-center justify-center">
            <MapPin size={40} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">Map View</Text>
          </View>
          <View className="flex-row items-center mt-3">
            <MapPin size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2 flex-1">
              {hospital.address}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

