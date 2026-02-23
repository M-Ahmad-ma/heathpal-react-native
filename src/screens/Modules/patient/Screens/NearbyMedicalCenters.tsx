import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  Navigation,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../../../services/api';

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
}


const SkeletonLoader = ({
  width,
  height,
  className,
}: {
  width: number | '100%';
  height: number;
  className?: string;
}) => {
  return (
    <View
      className={`bg-gray-200 ${className || ''}`}
      style={[{ width }, { height }]}
    />
  );
};

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
        source={{ uri: uri || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800' }}
        className={className}
        style={[style, { opacity: loading ? 0 : 1 }]}
        resizeMode="cover"
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
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
      <View className="relative">
        <View className="w-full h-40 overflow-hidden">
          <ImageWithSkeleton
            uri={hospital.image}
            style={{ width: '100%', height: 160 }}
          />
        </View>
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
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} size={12} color="#FCD34D" fill="#FCD34D" />
          ))}
          <Text className="text-xs text-gray-500 ml-1">({hospital.reviewCount} reviews)</Text>
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

export const NearbyMedicalCenters = () => {
  const navigation = useNavigation<any>();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyCenters = async () => {
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
          console.log('Error fetching favorites:', favError);
        }

        // Fetch medical centers
        const response = await api.getMedicalCenters({
          type: 'Clinic',
          rating: '4',
          page: 1,
          limit: 20,
        });
        
        if (response?.data && Array.isArray(response.data)) {
          const mappedHospitals: Hospital[] = response.data.map((center: any) => ({
            id: center.id,
            name: center.name,
            address: center.address,
            rating: center.rating || 0,
            reviewCount: center.review_count || 0,
            distance: '2.5 km',
            type: center.type || 'Clinic',
            image: center.image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
            isFavorite: favIds.includes(center.id),
          }));
          setHospitals(mappedHospitals);
        }
      } catch (err) {
        console.error('Failed to fetch nearby centers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyCenters();
  }, []);

  const handleToggleHospitalFavorite = async (hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    const isFavorite = hospital?.isFavorite || false;
    
    // Optimistic toggle
    setHospitals(prevHospitals =>
      prevHospitals.map(hosp =>
        hosp.id === hospitalId
          ? { ...hosp, isFavorite: !hosp.isFavorite }
          : hosp,
      ),
    );

    // API call
    try {
      if (!isFavorite) {
        await api.addMedicalCenterToFavorites(hospitalId);
      } else {
        await api.removeMedicalCenterFromFavorites(hospitalId);
      }
    } catch (error) {
      // Revert on error
      setHospitals(prevHospitals =>
        prevHospitals.map(hosp =>
          hosp.id === hospitalId
            ? { ...hosp, isFavorite: isFavorite }
            : hosp,
        ),
      );
      console.log('Error toggling favorite:', error);
    }
  };

  const handleHospitalPress = (hospital: Hospital) => {
    navigation.navigate('MedicalCenterDetails', { hospitalId: hospital.id });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900 flex-1">
            Nearby Medical Centers
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#1F2937" />
              <Text className="text-gray-500 mt-4">Loading centers...</Text>
            </View>
          ) : hospitals.length > 0 ? (
            hospitals.map(hospital => (
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
              <MapPin size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-base text-center mt-4 mb-2">
                No medical centers found
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                Check back later for nearby medical centers
              </Text>
            </View>
          )}
          <View className="h-6" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
