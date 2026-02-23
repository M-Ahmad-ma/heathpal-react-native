import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Star, Heart, Navigation } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { api, showApiError } from '../../../../services/api';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  reviews: string;
  image: string;
  bgColor: string;
  isFavorite: boolean;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: string;
  distance: string;
  type: 'Hospital' | 'Clinic';
  image: string;
  isFavorite: boolean;
}

// All data now comes from backend API - no inline mock data

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

const DoctorCard = ({
  doctor,
  onPress,
  onToggleFavorite,
}: {
  doctor: Doctor;
  onPress: () => void;
  onToggleFavorite: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-200"
    >
      <View className="flex-row p-4">
        {/* Doctor Image */}
        <View
          className="w-24 h-24 rounded-2xl overflow-hidden mr-3"
          style={{ backgroundColor: doctor.bgColor }}
        >
          <ImageWithSkeleton
            uri={doctor.image}
            style={{ width: 96, height: 96 }}
            bgColor={doctor.bgColor}
          />
        </View>

        {/* Doctor Info */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-base font-bold text-gray-900 flex-1">
              {doctor.name}
            </Text>
            <TouchableOpacity onPress={onToggleFavorite} className="ml-2">
              <Heart
                size={20}
                color={doctor.isFavorite ? '#000' : '#E5E7EB'}
                fill={doctor.isFavorite ? '#000' : '#E5E7EB'}
              />
            </TouchableOpacity>
          </View>

          <Text className="text-sm text-gray-600 mb-2">{doctor.specialty}</Text>

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
            <Text className="text-xs text-gray-500 ml-1">
              {doctor.reviews}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HospitalCard = ({
  hospital,
  onPress,
  onToggleFavorite,
}: {
  hospital: Hospital;
  onPress: () => void;
  onToggleFavorite: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-200"
    >
      {/* Hospital Image */}
      <View className="relative">
        <View className="w-full h-40 overflow-hidden">
          <ImageWithSkeleton
            uri={hospital.image}
            style={{ width: '100%', height: 160 }}
          />
        </View>
        {/* Favorite Heart Icon */}
        <TouchableOpacity
          onPress={onToggleFavorite}
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full items-center justify-center"
        >
          <Heart
            size={18}
            color={hospital.isFavorite ? '#000' : '#9CA3AF'}
            fill={hospital.isFavorite ? '#000' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Hospital Info */}
      <View className="p-4">
        <Text className="text-base font-bold text-gray-900 mb-2">
          {hospital.name}
        </Text>

        <View className="flex-row items-center mb-2">
          <MapPin size={14} color="#6B7280" />
          <Text className="text-xs text-gray-500 ml-1 flex-1">
            {hospital.address}
          </Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Text className="text-sm font-semibold text-gray-900 mr-1">
            {hospital.rating}
          </Text>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              color="#FCD34D"
              fill="#FCD34D"
            />
          ))}
          <Text className="text-xs text-gray-500 ml-1">
            {hospital.reviews}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Navigation size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">
              {hospital.distance}
            </Text>
          </View>

          <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
            <View className="w-2 h-2 bg-gray-400 rounded-sm mr-1.5" />
            <Text className="text-xs font-medium text-gray-600">
              {hospital.type}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const Favorites = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'doctors' | 'hospitals'>(
    'doctors'
  );
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch favorites from API
  const fetchFavorites = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await api.getFavorites();
      if (response?.data && Array.isArray(response.data)) {
        const favDoctors: Doctor[] = response.data
          .filter((fav: any) => fav.type === 'doctor' || fav.doctorId)
          .map((fav: any) => ({
            id: fav.doctorId || fav.id,
            name: fav.doctorName || fav.name || 'Doctor',
            specialty: fav.specialty || 'General',
            location: fav.location || 'N/A',
            rating: fav.rating || 4.5,
            reviews: fav.reviews || '0 Reviews',
            image: fav.image || fav.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
            bgColor: '#F8BBD0',
            isFavorite: true,
          }));

        const favHospitals: Hospital[] = response.data
          .filter((fav: any) => fav.type === 'medical_center' || fav.centerId)
          .map((fav: any) => ({
            id: fav.centerId || fav.id,
            name: fav.name || 'Medical Center',
            address: fav.address || 'N/A',
            rating: fav.rating || 4.5,
            reviews: fav.reviews || '(0 Reviews)',
            distance: fav.distance || 'N/A',
            type: fav.centerType || 'Hospital',
            image: fav.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            isFavorite: true,
          }));

        setDoctors(favDoctors);
        setHospitals(favHospitals);
      } else {
        setDoctors([]);
        setHospitals([]);
      }
    } catch (error) {
      console.log('Error fetching favorites:', error);
      setDoctors([]);
      setHospitals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleDoctorFavorite = async (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    // Optimistic update
    setDoctors((prevDoctors) =>
      prevDoctors.map((doc) =>
        doc.id === doctorId ? { ...doc, isFavorite: !doc.isFavorite } : doc
      )
    );

    try {
      if (doctor.isFavorite) {
        await api.removeDoctorFromFavorites(doctorId);
      } else {
        await api.addDoctorToFavorites(doctorId);
      }
    } catch (error) {
      // Revert on error
      setDoctors((prevDoctors) =>
        prevDoctors.map((doc) =>
          doc.id === doctorId ? { ...doc, isFavorite: !doc.isFavorite } : doc
        )
      );
      showApiError(error);
    }
  };

  const handleToggleHospitalFavorite = async (hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!hospital) return;

    // Optimistic update
    setHospitals((prevHospitals) =>
      prevHospitals.map((hosp) =>
        hosp.id === hospitalId
          ? { ...hosp, isFavorite: !hosp.isFavorite }
          : hosp
      )
    );

    try {
      if (hospital.isFavorite) {
        await api.removeMedicalCenterFromFavorites(hospitalId);
      } else {
        await api.addMedicalCenterToFavorites(hospitalId);
      }
    } catch (error) {
      // Revert on error
      setHospitals((prevHospitals) =>
        prevHospitals.map((hosp) =>
          hosp.id === hospitalId
            ? { ...hosp, isFavorite: !hosp.isFavorite }
            : hosp
        )
      );
      showApiError(error);
    }
  };

  const handleDoctorPress = (doctor: Doctor) => {
    console.log('Navigate to doctor details:', doctor.id);
    // Add navigation logic here
  };

  const handleHospitalPress = (hospital: Hospital) => {
    console.log('Navigate to hospital details:', hospital.id);
    // Add navigation logic here
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1F2937" />
        <Text className="mt-4 text-gray-600">Loading favorites...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900 flex-1">
            Favorites
          </Text>
        </View>

        {/* Tabs */}
        <View className="px-5 pt-4 pb-2 border-b border-gray-200">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setSelectedTab('doctors')}
              className="flex-1 pb-3 items-center mr-4"
            >
              <Text
                className={`text-base font-medium ${selectedTab === 'doctors' ? 'text-gray-900' : 'text-gray-400'
                  }`}
              >
                Doctors
              </Text>
              {selectedTab === 'doctors' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab('hospitals')}
              className="flex-1 pb-3 items-center"
            >
              <Text
                className={`text-base font-medium ${selectedTab === 'hospitals'
                  ? 'text-gray-900'
                  : 'text-gray-400'
                  }`}
              >
                Hospitals
              </Text>
              {selectedTab === 'hospitals' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {selectedTab === 'doctors' ? (
            doctors.filter((doc) => doc.isFavorite).length > 0 ? (
              doctors
                .filter((doc) => doc.isFavorite)
                .map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onPress={() => handleDoctorPress(doctor)}
                    onToggleFavorite={() => handleToggleDoctorFavorite(doctor.id)}
                  />
                ))
            ) : (
              <View className="items-center justify-center py-20">
                <Heart size={48} color="#D1D5DB" />
                <Text className="text-gray-500 text-base text-center mt-4 mb-2">
                  No favorite doctors
                </Text>
                <Text className="text-gray-400 text-sm text-center">
                  Start adding doctors to your favorites
                </Text>
              </View>
            )
          ) : hospitals.filter((hosp) => hosp.isFavorite).length > 0 ? (
            hospitals
              .filter((hosp) => hosp.isFavorite)
              .map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  onPress={() => handleHospitalPress(hospital)}
                  onToggleFavorite={() =>
                    handleToggleHospitalFavorite(hospital.id)
                  }
                />
              ))
          ) : (
            <View className="items-center justify-center py-20">
              <Heart size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-base text-center mt-4 mb-2">
                No favorite hospitals
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                Start adding hospitals to your favorites
              </Text>
            </View>
          )}
          <View className="h-6" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
