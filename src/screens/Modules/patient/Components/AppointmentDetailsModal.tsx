import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { X, Calendar, Clock, MapPin } from 'lucide-react-native';
import { usePatientUI } from './PatientUIContext';

export const AppointmentDetailsModal = () => {
  const { isAppointmentModalOpen, closeAppointmentModal } = usePatientUI();

  return (
    <Modal
      visible={isAppointmentModalOpen}
      transparent
      animationType="fade"
      onRequestClose={closeAppointmentModal}
    >
      <Pressable className="flex-1 bg-black/50" onPress={closeAppointmentModal}>
        <Pressable
          className="flex-1 justify-center p-5"
          onPress={e => e.stopPropagation()}
        >
          <View className="bg-white rounded-3xl overflow-hidden">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">
                Appointment Details
              </Text>
              <TouchableOpacity
                onPress={closeAppointmentModal}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-5">
              <View className="flex-row items-center mb-6">
                <View className="w-16 h-16 bg-[#009689]/10 rounded-2xl items-center justify-center mr-4">
                  <Calendar size={32} color="#009689" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900">
                    General Cleaning
                  </Text>
                  <Text className="text-base text-gray-500">
                    Dr. Sarah Johnson
                  </Text>
                </View>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                <View className="flex-row items-center mb-3">
                  <Calendar size={18} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-2">
                    May 20, 2024
                  </Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <Clock size={18} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-2">
                    10:30 AM - 11:30 AM
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={18} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-2">
                    Downtown Clinic, Suite 100
                  </Text>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  Services
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <View className="bg-[#009689]/10 px-3 py-1.5 rounded-full">
                    <Text className="text-sm font-medium text-[#009689]">
                      Teeth Cleaning
                    </Text>
                  </View>
                  <View className="bg-[#009689]/10 px-3 py-1.5 rounded-full">
                    <Text className="text-sm font-medium text-[#009689]">
                      Oral Examination
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  Status
                </Text>
                <View className="bg-[#CBFBF1] px-3 py-2 rounded-lg">
                  <Text className="text-sm font-semibold text-[#0D9D8F]">
                    Confirmed
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={closeAppointmentModal}
                  className="flex-1 bg-[#009689] rounded-xl py-4 items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    Reschedule
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={closeAppointmentModal}
                  className="flex-1 bg-red-50 rounded-xl py-4 items-center border border-red-200"
                >
                  <Text className="text-red-600 font-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
