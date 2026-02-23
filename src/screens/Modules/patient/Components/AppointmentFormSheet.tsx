import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { X, Calendar, Clock, MapPin, Star } from 'lucide-react-native';
import { usePatientUI, Doctor } from './PatientUIContext';
import { api } from '../../../../services/api';

const defaultServices = [
  'Teeth Cleaning',
  'Fillings',
  'Root Canal',
  'Checkup',
  'Whitening',
];

const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
  <View
    className="bg-white rounded-2xl border border-gray-200 p-4 mb-4"
    style={{ shadowColor: '#000', elevation: 4 }}
  >
    <View className="flex-row items-center">
      <View
        className="w-20 h-20 rounded-2xl overflow-hidden mr-3"
        style={{ backgroundColor: doctor.bgColor || '#F8BBD0' }}
      >
        <Image
          source={{ uri: doctor.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900">{doctor.name}</Text>
        <Text className="text-sm text-teal-600 font-medium">
          {doctor.specialty}
        </Text>
        <View className="flex-row items-center mt-1">
          <Star size={14} color="#FCD34D" fill="#FCD34D" />
          <Text className="text-sm text-gray-600 ml-1">{doctor.rating}</Text>
          <Text className="text-sm text-gray-400 ml-1">
            {doctor.reviews || '0 Reviews'}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

export const AppointmentFormSheet = () => {
  const {
    isAppointmentFormOpen,
    closeAppointmentForm,
    selectedDoctorForAppointment,
  } = usePatientUI();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'video'>('in-person');

  useEffect(() => {
    if (!isAppointmentFormOpen) {
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
      setLocation('');
      setNotes('');
    } else if (selectedDoctorForAppointment?.services && selectedDoctorForAppointment.services.length > 0) {
      setSelectedService(selectedDoctorForAppointment.services[0]);
    }
  }, [isAppointmentFormOpen, selectedDoctorForAppointment]);

  const snapPoints = useMemo(() => ['90%'], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        closeAppointmentForm();
      }
    },
    [closeAppointmentForm],
  );

  const handleClose = () => {
    bottomSheetRef.current?.close();
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert(
        'Missing Information',
        'Please select service, date and time',
      );
      return;
    }

    if (!doctor?.id) {
      Alert.alert('Error', 'Doctor information is missing');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.bookAppointment({
        doctorId: doctor.id,
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        notes: notes || undefined,
        medicalCenterId: location ? location : undefined,
      });

      if (response.success || response.data?.success) {
        Alert.alert(
          'Success',
          response.message || 'Appointment booked successfully!',
          [{ text: 'OK', onPress: () => closeAppointmentForm() }],
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to book appointment');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const doctor = selectedDoctorForAppointment;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isAppointmentFormOpen ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      detached
      backgroundStyle={{
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      style={{ marginHorizontal: 0 }}
      handleIndicatorStyle={{
        backgroundColor: '#E5E7EB',
        width: 40,
        height: 4,
      }}
    >
      <BottomSheetView className="flex-1 bg-white">
        <BottomSheetScrollView
          contentContainerClassName="px-6 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">
              Book Appointment
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="p-2 bg-gray-100 rounded-full"
            >
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {doctor && <DoctorCard doctor={doctor} />}

          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Select Service
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {(doctor?.services?.length ? doctor.services : defaultServices).map(service => (
                <TouchableOpacity
                  key={service}
                  onPress={() => setSelectedService(service)}
                  className={`px-3 py-2 rounded-lg ${
                    selectedService === service
                      ? 'bg-[#009689]'
                      : 'bg-[#009689]/10'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedService === service
                        ? 'text-white'
                        : 'text-[#009689]'
                    }`}
                  >
                    {service}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Select Date
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
              <Calendar size={18} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Select date"
                placeholderTextColor="#9CA3AF"
                value={selectedDate}
                onChangeText={setSelectedDate}
              />
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Select Time
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
              <Clock size={18} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Select time"
                placeholderTextColor="#9CA3AF"
                value={selectedTime}
                onChangeText={setSelectedTime}
              />
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Location
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
              <MapPin size={18} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Select location"
                placeholderTextColor="#9CA3AF"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Appointment Type
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setAppointmentType('in-person')}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  appointmentType === 'in-person'
                    ? 'bg-[#009689] border-[#009689]'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text
                  className={`font-medium ${
                    appointmentType === 'in-person'
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  In-Person
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAppointmentType('video')}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  appointmentType === 'video'
                    ? 'bg-[#009689] border-[#009689]'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text
                  className={`font-medium ${
                    appointmentType === 'video' ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  Video Call
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Notes (Optional)
            </Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3 h-24">
              <TextInput
                className="flex-1 text-gray-900"
                placeholder="Any additional notes..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleConfirmBooking}
            disabled={isLoading}
            className={`bg-black rounded-xl py-3.5 items-center ${
              isLoading ? 'opacity-70' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Confirm Booking
              </Text>
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};
