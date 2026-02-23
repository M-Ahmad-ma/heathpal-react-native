import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Clock, Plus, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../services/api';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

const days = [
  { id: 'mon', label: 'Monday', enabled: true },
  { id: 'tue', label: 'Tuesday', enabled: true },
  { id: 'wed', label: 'Wednesday', enabled: true },
  { id: 'thu', label: 'Thursday', enabled: true },
  { id: 'fri', label: 'Friday', enabled: true },
  { id: 'sat', label: 'Saturday', enabled: false },
  { id: 'sun', label: 'Sunday', enabled: false },
];

export const ScheduleSettings = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [daySchedules, setDaySchedules] = useState<Record<string, TimeSlot[]>>({
    mon: [{ id: '1', startTime: '09:00', endTime: '17:00' }],
    tue: [{ id: '2', startTime: '09:00', endTime: '17:00' }],
    wed: [{ id: '3', startTime: '09:00', endTime: '17:00' }],
    thu: [{ id: '4', startTime: '09:00', endTime: '17:00' }],
    fri: [{ id: '5', startTime: '09:00', endTime: '17:00' }],
  });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await api.getDoctorSchedule(user.id);
      
      if (response.success && response.data) {
        setScheduleEnabled(response.data.enabled || false);
        
        const fetchedSchedules: Record<string, TimeSlot[]> = {};
        
        Object.entries(response.data.schedules || {}).forEach(([dayKey, slots]: [string, any]) => {
          fetchedSchedules[dayKey] = (slots || []).map((slot: any, index: number) => ({
            id: slot.id || `${dayKey}-${index}`,
            startTime: slot.startTime || '09:00',
            endTime: slot.endTime || '17:00',
          }));
        });

        if (Object.keys(fetchedSchedules).length > 0) {
          setDaySchedules(fetchedSchedules);
        }
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setSaving(true);
    try {
      await api.updateDoctorSchedule(user.id, {
        enabled: scheduleEnabled,
        schedules: daySchedules,
      });
      Alert.alert('Success', 'Schedule saved successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const addTimeSlot = (dayId: string) => {
    setDaySchedules(prev => ({
      ...prev,
      [dayId]: [
        ...(prev[dayId] || []),
        {
          id: Date.now().toString(),
          startTime: '09:00',
          endTime: '17:00',
        },
      ],
    }));
  };

  const removeTimeSlot = (dayId: string, slotId: string) => {
    setDaySchedules(prev => ({
      ...prev,
      [dayId]: prev[dayId]?.filter(slot => slot.id !== slotId) || [],
    }));
  };

  const timeOptions = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#009689" />
        <Text className="text-gray-500 mt-4">Loading schedule...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900 ml-4">
            Schedule Settings
          </Text>
        </View>

        {/* Enable Schedule Toggle */}
        <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              Enable Scheduling
            </Text>
            <Text className="text-sm text-gray-500">
              Allow patients to book appointments
            </Text>
          </View>
          <Switch
            value={scheduleEnabled}
            onValueChange={setScheduleEnabled}
            trackColor={{ false: '#E5E7EB', true: '#009689' }}
            thumbColor="white"
          />
        </View>

        {/* Weekly Schedule */}
        <View className="px-5 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Schedule
          </Text>

          {days.map(day => (
            <View
              key={day.id}
              className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-medium text-gray-900">
                  {day.label}
                </Text>
                <TouchableOpacity
                  onPress={() => addTimeSlot(day.id)}
                  className="flex-row items-center bg-[#009689]/10 px-3 py-1 rounded-lg"
                >
                  <Plus size={14} color="#009689" />
                  <Text className="text-xs font-medium text-[#009689] ml-1">
                    Add Slot
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Time Slots */}
              {(daySchedules[day.id] || []).map((slot, index) => (
                <View
                  key={slot.id}
                  className="flex-row items-center gap-2 mb-2"
                >
                  <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                    <Clock size={16} color="#6B7280" />
                    <Text className="flex-1 text-sm text-gray-700 ml-2 text-center">
                      {slot.startTime}
                    </Text>
                    <Text className="text-gray-400 mx-1">-</Text>
                    <Text className="flex-1 text-sm text-gray-700 text-center">
                      {slot.endTime}
                    </Text>
                  </View>

                  {index > 0 && (
                    <TouchableOpacity
                      onPress={() => removeTimeSlot(day.id, slot.id)}
                      className="p-2 bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {(daySchedules[day.id]?.length === 0 ||
                !daySchedules[day.id]) && (
                <Text className="text-sm text-gray-400 italic">
                  No time slots added
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Save Button */}
        <View className="px-5 py-4 pb-8">
          <TouchableOpacity
            onPress={handleSaveSchedule}
            className="bg-[#009689] rounded-xl py-4 items-center"
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Save Schedule
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleSettings;
