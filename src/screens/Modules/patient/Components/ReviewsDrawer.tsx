import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star } from 'lucide-react-native';
import { usePatientUI } from './PatientUIContext';
import { api } from '../../../../services/api';

interface ReviewItem {
  id: string;
  userId: string;
  doctorId: string;
  rating: number;
  comment: string;
  createdAt: string;
  patientName?: string;
  patientProfileImage?: string;
}

export const ReviewsDrawer = () => {
  const { isReviewsDrawerOpen, selectedDoctor, closeReviewsDrawer, reviewsDrawerDoctorId, reviewsDrawerDoctorName } = usePatientUI();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const doctorId = reviewsDrawerDoctorId || selectedDoctor?.id;
  const doctorName = reviewsDrawerDoctorName || selectedDoctor?.name;

  const fetchReviews = async (pageNum = 1, isRefresh = false) => {
    if (!doctorId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await api.getDoctorReviews(doctorId, pageNum, 10);

      if (response?.data) {
        const { reviews: newReviews, averageRating: avg, totalReviews: total } = response.data;

        if (pageNum === 1) {
          setReviews(newReviews || []);
        } else {
          setReviews(prev => [...prev, ...(newReviews || [])]);
        }

        setAverageRating(avg || 0);
        setTotalReviews(total || 0);
        setHasMore(newReviews?.length === 10);
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isReviewsDrawerOpen && doctorId) {
      setPage(1);
      fetchReviews(1);
    }
  }, [isReviewsDrawerOpen, doctorId]);

  const handleRefresh = () => {
    setPage(1);
    fetchReviews(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            color={star <= rating ? '#F59E0B' : '#E5E7EB'}
            fill={star <= rating ? '#F59E0B' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const renderReviewItem = ({ item }: { item: ReviewItem }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100" style={{ shadowColor: '#000', elevation: 2 }}>
      <View className="flex-row items-center mb-3">
        {item.patientProfileImage ? (
          <Image
            source={{ uri: item.patientProfileImage }}
            className="w-10 h-10 rounded-full mr-3"
            resizeMode="cover"
          />
        ) : (
          <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
            <Text className="text-gray-600 font-bold text-sm">
              {item.patientName ? item.patientName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">
            {item.patientName || 'Anonymous Patient'}
          </Text>
          <View className="flex-row items-center mt-1">
            {renderStars(item.rating)}
            <Text className="text-xs text-gray-500 ml-2">{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>
      <Text className="text-sm text-gray-600 leading-5">{item.comment}</Text>
    </View>
  );

  const renderHeader = () => (
    <View className="bg-white px-5 py-4 border-b border-gray-200">
      <View className="flex-row items-center justify-center mb-3">
        <Text className="text-xl font-bold text-gray-900">{doctorName || 'Doctor'}</Text>
      </View>
      <View className="flex-row items-center justify-center">
        <Star size={20} color="#F59E0B" fill="#F59E0B" />
        <Text className="text-lg font-bold text-gray-900 ml-1">{averageRating.toFixed(1)}</Text>
        <Text className="text-sm text-gray-500 ml-1">({totalReviews} reviews)</Text>
      </View>
    </View>
  );

  if (!isReviewsDrawerOpen) return null;

  return (
    <View className="absolute right-0 top-0 bottom-0 bg-white w-full h-full">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={closeReviewsDrawer} className="mr-4">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Reviews</Text>
      </View>

      {loading && page === 1 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#009689" />
          <Text className="mt-4 text-gray-500">Loading reviews...</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Star size={48} color="#E5E7EB" fill="transparent" />
              <Text className="mt-4 text-gray-500 text-base">No reviews yet</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && !loading ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#009689" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default ReviewsDrawer;
