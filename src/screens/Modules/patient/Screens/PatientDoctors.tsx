
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Star,
  MapPin,
  Search,
  Heart,
  ArrowLeft,
} from 'lucide-react-native';
import { usePatientUI, Doctor } from '../Components/PatientUIContext';
import { useNavigation } from '@react-navigation/native';
import { api, showApiError } from '../../../../services/api';

const specialties = [
  'All',
  'General Dentist',
  'Pediatric Dentist',
  'Orthodontist',
  'Cardiologist',
  'Dentist',
];

// Skeleton Loader
const SkeletonLoader = ({
  width,
  height,
  className,
}: {
  width: number | string;
  height: number;
  className?: string;
}) => (
  <View
    className={`bg-gray-200 ${className}`}
    style={{ width, height }}
  />
);

// Image with Skeleton
const ImageWithSkeleton = ({
  uri,
  className,
  style,
  bgColor,
}: {
  uri: string;
  className?: string;
  style?: any;
  bgColor?: string;
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={[{ backgroundColor: bgColor || '#F3F4F6' }, style]}>
      {loading && (
        <SkeletonLoader
          width="100%"
          height={style?.height || 200}
          className={className}
        />
      )}
      <Image
        source={{ uri }}
        className={className}
        style={[style, { display: loading ? 'none' : 'flex' }]}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

export const PatientDoctors = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteDoctors, setFavoriteDoctors] = useState<string[]>([]);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { openDoctorDrawer } = usePatientUI();
  const navigation = useNavigation();

  // Fetch doctors (API ONLY)
  const fetchDoctors = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await api.getDoctors();

      if (response?.data && Array.isArray(response.data)) {
        const mappedDoctors: Doctor[] = response.data.map((doc: any) => ({
          id: doc.id || doc._id,
          name: doc.fullName || doc.name || 'Unknown Doctor',
          specialty: doc.specialty || 'General',
          rating: doc.rating ?? 0,
          experience: doc.experience || 'N/A',
          location: doc.location || 'N/A',
          reviews: `${doc.reviewCount || 0} Reviews`,
          image:
            doc.profileImage ||
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
          bio: doc.bio || '',
          education: doc.education || [],
          services: doc.services || [],
          availability: doc.availability || [],
          available: doc.available ?? true,
          bgColor: ['#F8BBD0', '#FFCC80', '#A5D6A7', '#CE93D8'][
            Math.floor(Math.random() * 4)
          ],
          reviewsArray: doc.reviewsArray || [
            {
              id: `review_${doc.id}_1`,
              name: 'Patient',
              image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
              rating: Math.round(doc.rating || 4),
              comment: 'Great experience! The doctor was very professional and caring.',
            },
            {
              id: `review_${doc.id}_2`,
              name: 'Patient',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
              rating: Math.round(doc.rating || 4) + (Math.random() > 0.5 ? 1 : 0),
              comment: 'Highly recommend! Excellent service and very friendly staff.',
            },
          ],
        }));

        setDoctorsList(mappedDoctors);
      } else {
        setDoctorsList([]);
      }
    } catch (error) {
      console.log('Error fetching doctors:', error);
      setDoctorsList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch favorite doctors
  const fetchFavorites = async () => {
    try {
      const response = await api.getFavorites({ type: 'doctor' });
      if (response?.data && Array.isArray(response.data)) {
        const ids = response.data.map(
          (fav: any) => fav.doctorId || fav.id
        );
        setFavoriteDoctors(ids);
      }
    } catch (error) {
      console.log('Error fetching favorites:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchFavorites();
  }, []);

  const handleDoctorPress = (doctor: Doctor) => {
    openDoctorDrawer(doctor, 'general');
  };

  // Toggle favorite
  const toggleFavorite = async (id: string) => {
    const isFavorite = favoriteDoctors.includes(id);

    setFavoriteDoctors((prev) =>
      isFavorite ? prev.filter((d) => d !== id) : [...prev, id]
    );

    try {
      if (isFavorite) {
        await api.removeDoctorFromFavorites(id);
      } else {
        await api.addDoctorToFavorites(id);
      }
    } catch (error) {
      setFavoriteDoctors((prev) =>
        isFavorite ? [...prev, id] : prev.filter((d) => d !== id)
      );
      showApiError(error);
    }
  };

  // Filter logic
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doctor) => {
      const matchesSpecialty =
        selectedSpecialty === 'All' ||
        doctor.specialty === selectedSpecialty ||
        (selectedSpecialty === 'Dentist' && doctor.specialty.includes('Dentist')) ||
        (selectedSpecialty === 'General' && doctor.specialty === 'General Dentist');

      const matchesSearch =
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSpecialty && matchesSearch;
    });
  }, [selectedSpecialty, searchQuery, doctorsList]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-4 bg-white">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3"
            >
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 flex-1">
              All Doctors
            </Text>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-1 mb-4">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search doctor..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-sm text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Specialty Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                onPress={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-full mr-2 ${selectedSpecialty === specialty
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                  }`}
              >
                <Text
                  className={`text-sm ${selectedSpecialty === specialty
                      ? 'text-white'
                      : 'text-gray-700'
                    }`}
                >
                  {specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Result Count */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-semibold text-gray-900">
              {filteredDoctors.length} found
            </Text>
          </View>

          {/* Doctors List */}
          {filteredDoctors.map((doctor) => (
            <TouchableOpacity
              key={doctor.id}
              onPress={() => handleDoctorPress(doctor)}
              activeOpacity={0.7}
              className="bg-white rounded-xl mb-3 overflow-hidden border border-gray-200"
              style={{ elevation: 4 }}
            >
              <View className="flex-row p-3">
                {/* Image */}
                <View
                  className="w-24 h-24 rounded-lg overflow-hidden mr-3"
                  style={{ backgroundColor: doctor.bgColor }}
                >
                  <ImageWithSkeleton
                    uri={doctor.image}
                    style={{ width: 96, height: 96 }}
                    bgColor={doctor.bgColor}
                  />
                </View>

                {/* Info */}
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-base font-bold text-gray-900">
                      {doctor.name}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(doctor.id);
                      }}
                    >
                      <Heart
                        size={20}
                        color={
                          favoriteDoctors.includes(doctor.id)
                            ? 'black'
                            : 'gray'
                        }
                        fill={
                          favoriteDoctors.includes(doctor.id)
                            ? 'black'
                            : 'none'
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-sm text-gray-600 mb-2">
                    {doctor.specialty}
                  </Text>

                  <View className="flex-row items-center mb-2">
                    <MapPin size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500 ml-1 flex-1">
                      {doctor.location}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Star size={14} color="#FCD34D" fill="#FCD34D" />
                    <Text className="text-xs font-semibold text-gray-900 ml-1">
                      {doctor.rating}
                    </Text>
                    <Text className="text-xs text-gray-500 ml-4">
                      {doctor.reviews}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View className="h-6" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

