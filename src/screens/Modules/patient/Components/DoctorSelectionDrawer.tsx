import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import {
  usePatientUI,
  getDoctorsBySpecialty,
  getAllSpecialties,
  Doctor,
} from './PatientUIContext';
import { renderDoctorCard } from './DoctorsCard';

export const DoctorSelectionDrawer = () => {
  const { closeDrawer, openDoctorDrawer } = usePatientUI();
  const doctorsBySpecialty = getDoctorsBySpecialty();
  const specialties = getAllSpecialties();
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = () => {
    closeDrawer();
  };

  const handleDoctorPress = (doctor: Doctor) => {
    closeDrawer();
    setTimeout(() => openDoctorDrawer(doctor), 100);
  };

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            Book Appointment
          </Text>
          <Text className="text-sm text-gray-500">Select a doctor</Text>
        </View>
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 py-4">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-1">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Search doctors..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {filteredSpecialties.map(specialty => {
          const doctors = doctorsBySpecialty[specialty] || [];

          return (
            <View key={specialty} className="mb-4">
              <Text className="font-semibold text-gray-900">{specialty}</Text>
              {doctors.map(doctor => (
                <TouchableOpacity
                  key={doctor.id}
                  onPress={() => handleDoctorPress(doctor)}
                  activeOpacity={0.7}
                >
                  {renderDoctorCard(doctor)}
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        {filteredSpecialties.length === 0 && (
          <View className="items-center py-10">
            <Text className="text-gray-500">No doctors found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
