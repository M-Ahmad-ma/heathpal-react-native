import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { ArrowLeft, Star } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../types/navigation';
import { api, getAuthHeaders, API_BASE_URL } from '../../../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'AddReview'>;

interface ReviewResponse {
  success: boolean;
  message?: string;
  data?: { success: boolean };
}

export const AddReview = ({ route, navigation }: Props) => {
  const { doctorId, doctorName, appointmentId } = route.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }

    if (!doctorId) {
      Alert.alert('Error', 'Doctor information is missing');
      return;
    }

    setIsLoading(true);

    try {
      const authHeaders = getAuthHeaders();
      const url = `${API_BASE_URL}/doctors/${doctorId}/reviews`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeaders.token && { 'Authorization': `Bearer ${authHeaders.token}` }),
          ...(authHeaders.userId && { 'X-User-Id': authHeaders.userId }),
          ...(authHeaders.userType && { 'X-User-Type': authHeaders.userType }),
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          appointmentId,
        }),
      });

      const data: ReviewResponse = await response.json();

      if (response.ok && (data.success || data.data?.success)) {
        Alert.alert(
          'Thank You!',
          'Your review has been submitted successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to submit review');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 ml-3">Add Review</Text>
        </View>

        <View className="flex-1 px-6 pt-8">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {doctorName || 'Doctor'}
          </Text>
          <Text className="text-sm text-gray-500 mb-8">
            How was your experience?
          </Text>

          <Text className="text-sm font-semibold text-gray-400 mb-4">
            Select Rating
          </Text>
          <View className="flex-row gap-3 mb-8">
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                className="p-2"
              >
                <Star
                  size={40}
                  color={star <= rating ? '#FCD34D' : '#E5E7EB'}
                  fill={star <= rating ? '#FCD34D' : 'none'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-semibold text-gray-400 mb-4">
            Your Review (Optional)
          </Text>
          <View className="bg-gray-50 rounded-xl px-4 py-4 h-40 mb-8">
            <TextInput
              className="flex-1 text-gray-900"
              placeholder="Share your experience with others..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
              maxLength={500}
            />
          </View>
          <Text className="text-xs text-gray-400 text-right mb-8">
            {comment.length}/500
          </Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || rating === 0}
            className={`bg-[#009689] rounded-xl py-4 items-center ${
              isLoading || rating === 0 ? 'opacity-70' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Submit Review
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
