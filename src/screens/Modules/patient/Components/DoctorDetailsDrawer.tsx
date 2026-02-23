import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import {
  X,
  Star,
  MapPin,
  Clock,
  Award,
  ArrowLeft,
  Heart,
  Users,
  Briefcase,
  MessageSquare,
} from 'lucide-react-native';
import { usePatientUI } from './PatientUIContext';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../../../services/api';

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

export const DoctorDetailsDrawer = () => {
  const {
    isDoctorDrawerOpen,
    selectedDoctor,
    closeDoctorDrawer,
    doctorDrawerSource,
    openReviewsDrawer,
  } = usePatientUI();

  const navigation = useNavigation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  // Check if doctor is favorite when drawer opens
  React.useEffect(() => {
    if (isDoctorDrawerOpen && selectedDoctor?.id) {
      checkFavoriteStatus();
      fetchDoctorReviews();
    }
  }, [isDoctorDrawerOpen, selectedDoctor]);

  const checkFavoriteStatus = async () => {
    if (!selectedDoctor?.id) return;
    try {
      setCheckingFavorite(true);
      const response = await api.checkDoctorIsFavorite(selectedDoctor.id);
      if (response?.data) {
        setIsFavorite(response.data.isFavorite);
      }
    } catch (error) {
    } finally {
      setCheckingFavorite(false);
    }
  };

  const fetchDoctorReviews = async () => {
    if (!selectedDoctor?.id) return;
    try {
      setLoadingReviews(true);
      const response = await api.getDoctorReviews(selectedDoctor.id, 1, 3);
      if (response?.data?.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      // Fallback to reviewsArray from selectedDoctor
      if (selectedDoctor?.reviewsArray) {
        setReviews(selectedDoctor.reviewsArray.slice(0, 3));
      }
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!selectedDoctor?.id) return;

    // Optimistic update
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);

    try {
      if (newStatus) {
        await api.addDoctorToFavorites(selectedDoctor.id);
      } else {
        await api.removeDoctorFromFavorites(selectedDoctor.id);
      }
    } catch (error) {
      // Revert on error
      setIsFavorite(!newStatus);
    }
  };

  const handleBookAppointment = () => {
    closeDoctorDrawer();
    navigation.navigate('BookAppointment' as never, {
      doctorId: selectedDoctor?.id,
      doctorName: selectedDoctor?.name,
      service: selectedDoctor?.specialty,
    } as never);
  };

  if (!isDoctorDrawerOpen || !selectedDoctor) return null;

  const isFromAppointments = doctorDrawerSource === 'appointments';

  return (
    <View className="absolute right-0 top-0 bottom-0 bg-white w-full h-full">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={closeDoctorDrawer}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Doctor Details
        </Text>
        <TouchableOpacity onPress={handleToggleFavorite} disabled={checkingFavorite}>
          <Heart
            size={24}
            color={isFavorite ? '#EF4444' : '#E5E7EB'}
            fill={isFavorite ? '#EF4444' : 'none'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Doctor Profile Card */}
        <View className="px-5 pt-4">
          <View
            className="bg-gray-50 rounded-2xl p-3"
            style={{ shadowColor: '#000', elevation: 5 }}
          >
            <View className="flex-row items-center ">
              <View
                className="w-24 h-24 rounded-2xl overflow-hidden mr-3"
                style={{ backgroundColor: selectedDoctor.bgColor || '#F8BBD0' }}
              >
                <ImageWithSkeleton
                  uri={selectedDoctor.image}
                  style={{ width: '100%', height: '100%' }}
                  bgColor={selectedDoctor.bgColor || '#F8BBD0'}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-4">
                  {selectedDoctor.name}
                </Text>
                <Text className="text-sm text-gray-600 mb-1">
                  {selectedDoctor.specialty}
                </Text>
                <View className="flex-row items-center">
                  <MapPin size={15} color="#6B7280" />
                  <Text className="text-xs text-gray-500 ml-1">
                    {selectedDoctor.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row justify-between px-5 py-4 border-b border-gray-100">
          <View className="flex-1 items-center">
            <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-2">
              <Award size={20} color="#000" fill="#000" />
            </View>
            <Text className="text-base font-bold text-gray-900">{selectedDoctor.experience}</Text>
            <Text className="text-xs text-gray-500">experience</Text>
          </View>

          <View className="flex-1 items-center">
            <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-2">
              <Star size={20} color="#000" fill="#000" />
            </View>
            <Text className="text-base font-bold text-gray-900">{selectedDoctor.rating}</Text>
            <Text className="text-xs text-gray-500">rating</Text>
          </View>

          <View className="flex-1 items-center">
            <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-2">
              <MessageSquare size={20} color="#000" fill="#000" />
            </View>
            <Text className="text-base font-bold text-gray-900">{selectedDoctor.reviews}</Text>
            <Text className="text-xs text-gray-500">reviews</Text>
          </View>
        </View>

        {/* About Me */}
        <View className="px-5 py-4 border-b border-gray-100">
          <Text className="text-base font-bold text-gray-900 mb-2">
            About me
          </Text>
          <Text className="text-sm text-gray-600 leading-relaxed" numberOfLines={bioExpanded ? undefined : 3}>
            {selectedDoctor.bio ||
              'Dr. David Patel, a dedicated cardiologist, brings a wealth of experience to Golden Gate Cardiology Center in Golden Gate, CA.'}
          </Text>
          <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)} className="mt-1">
            <Text className="text-sm text-blue-600 font-medium">
              {bioExpanded ? 'view less' : 'view more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Working Time */}
        <View className="px-5 py-4 border-b border-gray-100">
          <Text className="text-base font-bold text-gray-900 mb-2">
            Working Time
          </Text>
          <Text className="text-sm text-gray-600">
            {selectedDoctor.availability?.[0] ||
              'Monday-Friday, 08.00 AM-18.00 PM'}
          </Text>
        </View>

        {/* Reviews Section */}
        <View className="px-5 py-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-gray-900">Reviews</Text>
            <TouchableOpacity
              onPress={() => {
                if (selectedDoctor?.id) {
                  closeDoctorDrawer();
                  openReviewsDrawer(selectedDoctor.id, selectedDoctor.name);
                }
              }}
            >
              <Text className="text-sm text-blue-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          {loadingReviews ? (
            <View className="items-center py-4">
              <Text className="text-sm text-gray-500">Loading reviews...</Text>
            </View>
          ) : reviews.length > 0 ? (
            <View style={{ maxHeight: 400 }}>
              <ScrollView
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {reviews.map((review) => (
                  <View
                    key={review.id}
                    className="bg-gray-50 rounded-2xl p-4 mb-3"
                    style={{ shadowColor: '#000', elevation: 2 }}
                  >
                    <View className="flex-row items-start mb-2">
                      <View className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
                        <Image
                          source={{ uri: review.patientProfileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }}
                          className="w-10 h-10"
                          resizeMode="cover"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-sm font-bold text-gray-900 mb-1">
                          {review.patientName || 'Anonymous Patient'}
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="text-sm font-semibold text-gray-900 mr-1">
                            {review.rating.toFixed(1)}
                          </Text>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              color="#FCD34D"
                              fill={star <= Math.round(review.rating) ? '#FCD34D' : 'none'}
                            />
                          ))}
                        </View>
                      </View>
                    </View>

                    <Text className="text-sm text-gray-600 leading-relaxed">
                      {review.comment}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <Text className="text-sm text-gray-500">No reviews yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100">
        {isFromAppointments ? (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => {}}
              className="flex-1 bg-gray-100 rounded-full py-4 items-center"
            >
              <Text className="text-gray-900 font-semibold text-base">
                Add Review
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBookAppointment}
              className="flex-1 bg-gray-900 rounded-full py-4 items-center"
            >
              <Text className="text-white font-semibold text-base">
                Re-Book
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleBookAppointment}
            className="bg-gray-900 rounded-full py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              Book Appointment
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
