import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { ArrowLeft, MapPin, Star, Clock } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api, showApiError } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';

// Default time slots as fallback
const defaultTimeSlots = [
  ['09:00 AM', '09:30 AM', '10:00 AM'],
  ['10:30 AM', '11:00 AM', '11:30 AM'],
  ['02:00 PM', '02:30 PM', '03:00 PM'],
  ['03:30 PM', '04:00 PM', '04:30 PM'],
];

interface DoctorDetails {
  id: string;
  fullName: string;
  specialty: string;
  profileImage?: string;
  location?: string;
  rating: number;
  reviewCount: number;
  consultationFee?: number;
  services?: string[];
}

export const BookAppointment = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  // Get params from navigation
  const { doctorId, doctorName, service: initialService, medicalCenterId } = route.params || {};

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState(initialService || '');
  const [timeSlots, setTimeSlots] = useState<string[][]>(defaultTimeSlots);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [services, setServices] = useState<string[]>([]);

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!doctorId) return;

      try {
        setLoading(true);
        const response = await api.getDoctorDetails(doctorId);
        // Handle both direct data and wrapped response
        const doc = response?.data?.data || response?.data || response;
        if (doc && doc.id) {
          setDoctor({
            id: doc.id,
            fullName: doc.fullName || doc.name || 'Unknown Doctor',
            specialty: doc.specialty || 'General',
            profileImage: doc.profileImage,
            location: doc.location || 'Not specified',
            rating: doc.rating || 0,
            reviewCount: doc.reviewCount || 0,
            consultationFee: doc.consultationFee,
            services: doc.services?.length ? doc.services : ['General Consultation'],
          });
          setServices(doc.services?.length ? doc.services : ['General Consultation']);
          setSelectedService(doc.services?.[0] || 'General Consultation');
        }
      } catch (error) {
        console.log('Error fetching doctor details:', error);
        // Fallback: use navigation params if available
        if (doctorName) {
          setDoctor({
            id: doctorId,
            fullName: doctorName,
            specialty: initialService || 'General',
            location: 'Not specified',
            rating: 0,
            reviewCount: 0,
            services: initialService ? [initialService] : ['General Consultation'],
          });
          setServices(initialService ? [initialService] : ['General Consultation']);
          setSelectedService(initialService || 'General Consultation');
        } else if (doctorId) {
          // If no doctor name but we have an ID, still show something
          setDoctor({
            id: doctorId,
            fullName: 'Unknown Doctor',
            specialty: 'General',
            location: 'Not specified',
            rating: 0,
            reviewCount: 0,
            services: ['General Consultation'],
          });
          setServices(['General Consultation']);
          setSelectedService('General Consultation');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  // Format time from 24h to 12h format
  const formatTime12h = (time24: string): string => {
    try {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time24;
    }
  };

  // Format time from 12h to 24h format for API
  const formatTime24h = (time12: string): string => {
    try {
      const [time, period] = time12.split(' ');
      let [hours, minutes] = time.split(':');
      let hour = parseInt(hours);

      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }

      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    } catch {
      return time12;
    }
  };

  // Fetch available time slots when date changes
  const fetchTimeSlots = async (date: string) => {
    if (!doctorId) return;

    try {
      setSlotsLoading(true);
      const response = await api.getAvailableSlots(doctorId, date);

      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        // Format slots to 12h format and group into rows of 3
        const formattedSlots = response.data.map(formatTime12h);
        const rows: string[][] = [];
        for (let i = 0; i < formattedSlots.length; i += 3) {
          rows.push(formattedSlots.slice(i, i + 3));
        }
        setTimeSlots(rows.length > 0 ? rows : defaultTimeSlots);
      } else {
        setTimeSlots(defaultTimeSlots);
      }
    } catch (error) {
      console.log('Error fetching time slots:', error);
      setTimeSlots(defaultTimeSlots);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && doctorId) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate, doctorId]);

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleConfirm = async () => {
    if (!selectedTime) {
      Alert.alert('Select Time', 'Please select a time slot');
      return;
    }

    if (!selectedService) {
      Alert.alert('Select Service', 'Please select a service');
      return;
    }

    if (!doctorId) {
      Alert.alert('Error', 'Doctor information is missing');
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        doctorId,
        service: selectedService,
        date: selectedDate,
        time: formatTime24h(selectedTime),
        type: 'in-person' as const,
        notes: '',
      };

      await api.bookAppointment(bookingData);

      Alert.alert(
        'Booking Confirmed!',
        `Your appointment with ${doctor?.fullName || doctorName || 'the doctor'} on ${selectedDate} at ${selectedTime} has been confirmed.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      showApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity className="mr-4" onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Book Appointment
          </Text>
        </View>

        {/* Loading doctor info */}
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="small" color="#1F2937" />
            <Text className="text-gray-500 mt-2">Loading doctor details...</Text>
          </View>
        ) : (
          <>
            {/* Doctor Info Card */}
            <View className="mx-5 mb-4 p-4 bg-gray-50 rounded-xl">
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-3">
                  <Image
                    source={{ uri: doctor?.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200' }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {doctor?.fullName || doctorName || 'Unknown Doctor'}
                  </Text>
                  <Text className="text-sm text-gray-600">{doctor?.specialty}</Text>
                  <View className="flex-row items-center mt-1">
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text className="text-sm text-gray-600 ml-1">
                      {doctor?.rating?.toFixed(1) || '0.0'} ({doctor?.reviewCount || 0} reviews)
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <MapPin size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-500 ml-1">{doctor?.location}</Text>
                  </View>
                  {doctor?.consultationFee && (
                    <Text className="text-sm font-medium text-gray-900 mt-1">
                      ${doctor.consultationFee} per visit
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Select Service Section */}
            {services.length > 0 && (
              <View className="px-5 mb-6">
                <Text className="text-base font-bold text-gray-900 mb-4">
                  Select Service
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {services.map((svc, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedService(svc)}
                      className={`px-4 py-2 rounded-full ${
                        selectedService === svc ? 'bg-gray-900' : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selectedService === svc ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {svc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Select Date Section */}
            <View className="px-5 mb-6">
              <Text className="text-base font-bold text-gray-900 mb-4">
                Select Date
              </Text>

              {/* Calendar */}
              <View className="bg-gray-50 rounded-3xl overflow-hidden">
                <Calendar
                  current={today}
                  minDate={today}
                  onDayPress={handleDateSelect}
                  markedDates={{
                    [selectedDate]: {
                      selected: true,
                      selectedColor: '#1F2937',
                    },
                  }}
                  theme={{
                    backgroundColor: '#F9FAFB',
                    calendarBackground: '#F9FAFB',
                    textSectionTitleColor: '#6B7280',
                    selectedDayBackgroundColor: '#1F2937',
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: '#1F2937',
                    dayTextColor: '#1F2937',
                    textDisabledColor: '#D1D5DB',
                    monthTextColor: '#1F2937',
                    textMonthFontWeight: '600',
                    textMonthFontSize: 16,
                    textDayFontSize: 14,
                    textDayHeaderFontSize: 12,
                    arrowColor: '#1F2937',
                  }}
                  style={{
                    borderRadius: 24,
                    padding: 10,
                  }}
                />
              </View>
            </View>

            {/* Select Hour Section */}
            <View className="px-5 mb-6">
              <Text className="text-base font-bold text-gray-900 mb-4">
                Select Hour
              </Text>

              {slotsLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="small" color="#1F2937" />
                  <Text className="text-gray-500 mt-2">Loading available slots...</Text>
                </View>
              ) : (
                <>
                  {/* Time Slots */}
                  {timeSlots.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row gap-3 mb-3">
                      {row.map((time) => {
                        const isSelected = time === selectedTime;
                        return (
                          <TouchableOpacity
                            key={time}
                            onPress={() => setSelectedTime(time)}
                            className={`flex-1 py-3 rounded-full items-center ${
                              isSelected ? 'bg-gray-900' : 'bg-gray-100'
                            }`}
                          >
                            <Text
                              className={`text-sm font-medium ${
                                isSelected ? 'text-white' : 'text-gray-700'
                              }`}
                            >
                              {time}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </>
              )}
            </View>
          </>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Confirm Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100">
        <TouchableOpacity
          className={`rounded-full py-4 items-center ${
            submitting || !selectedTime || !selectedService ? 'bg-gray-400' : 'bg-gray-900'
          }`}
          onPress={handleConfirm}
          disabled={submitting || !selectedTime || !selectedService}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Confirm</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
