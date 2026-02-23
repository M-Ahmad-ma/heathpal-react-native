import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { api, showApiError } from '../../../../services/api';

interface RescheduleParams {
  appointmentId: string;
  doctorId?: string;
  currentDate: string;
  currentTime: string;
  doctorName: string;
  service: string;
}

// Default time slots as fallback
const defaultTimeSlots = [
  ['09:00 AM', '09:30 AM', '10:00 AM'],
  ['10:30 AM', '11:00 AM', '11:30 AM'],
  ['02:00 PM', '02:30 PM', '03:00 PM'],
  ['03:30 PM', '04:00 PM', '04:30 PM'],
];

export const Reschedule = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RescheduleParams;

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[][]>(defaultTimeSlots);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validate that selected date is not in the past
  const isDatePast = (dateString: string): boolean => {
    const selected = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  };

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
    if (!params?.doctorId || isDatePast(date)) return;

    try {
      setSlotsLoading(true);
      const response = await api.getAvailableSlots(params.doctorId, date);

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
    if (selectedDate && params?.doctorId) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate, params?.doctorId]);

  const handleDateSelect = (day: any) => {
    const selectedDateStr = day.dateString;
    
    // Prevent selecting past dates
    if (isDatePast(selectedDateStr)) {
      Alert.alert('Invalid Date', 'Please select a date that is not in the past');
      return;
    }
    
    setSelectedDate(selectedDateStr);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a new date and time');
      return;
    }

    // Validate selected date is not in the past
    if (isDatePast(selectedDate)) {
      Alert.alert('Invalid Date', 'Please select a date that is not in the past');
      return;
    }

    if (!params?.appointmentId) {
      Alert.alert('Error', 'Appointment information is missing');
      return;
    }

    Alert.alert(
      'Confirm Reschedule',
      `Reschedule appointment to ${selectedDate} at ${selectedTime}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setSubmitting(true);

              await api.rescheduleAppointment(
                params.appointmentId,
                selectedDate,
                formatTime24h(selectedTime)
              );

              Alert.alert(
                'Rescheduled!',
                'Your appointment has been successfully rescheduled.',
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
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Reschedule Appointment
          </Text>
        </View>

        {/* Current Appointment Info */}
        <View className="px-5 mb-4">
          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <Text className="text-xs font-medium text-gray-500 mb-1">
              CURRENT APPOINTMENT
            </Text>
            <Text className="text-base font-bold text-gray-900 mb-1">
              {params?.service || 'General Cleaning'}
            </Text>
            <View className="flex-row items-center flex-wrap">
              <Text className="text-sm text-gray-600">
                {params?.doctorName || 'Dr. Sarah Johnson'}
              </Text>
              <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
              <View className="flex-row items-center">
                <CalendarIcon size={14} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1">
                  {params?.currentDate || 'May 20, 2024'}
                </Text>
              </View>
              <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
              <View className="flex-row items-center">
                <Clock size={14} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1">
                  {params?.currentTime || '10:30 AM'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Select Date Section */}
        <View className="px-5 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-4">
            Select New Date
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

        {/* Select Time Section */}
        <View className="px-5 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-4">
            Select New Time
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
                        className={`flex-1 py-3 rounded-full items-center ${isSelected ? 'bg-gray-900' : 'bg-gray-100'
                          }`}
                      >
                        <Text
                          className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'
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

        {/* New Appointment Summary */}
        <View className="px-5 mb-6">
          <View className="bg-teal-50 rounded-2xl p-4 border border-teal-200">
            <Text className="text-xs font-semibold text-teal-700 mb-2">
              NEW APPOINTMENT
            </Text>
            <View className="flex-row items-center flex-wrap">
              <View className="flex-row items-center mr-4 mb-2">
                <CalendarIcon size={16} color="#0D9488" />
                <Text className="text-sm font-medium text-gray-900 ml-2">
                  {selectedDate || 'Select a date'}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Clock size={16} color="#0D9488" />
                <Text className="text-sm font-medium text-gray-900 ml-2">
                  {selectedTime || 'Select a time'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Confirm Button - Fixed at Bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleConfirmReschedule}
          disabled={submitting || !selectedTime}
          className={`rounded-full py-4 items-center ${submitting || !selectedTime ? 'bg-gray-400' : 'bg-gray-900'
            }`}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Confirm Reschedule
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Reschedule;
