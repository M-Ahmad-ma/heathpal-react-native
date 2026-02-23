import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Linking,
  Image
} from 'react-native';
import { X, Phone, Calendar, Mail, MapPin, AlertTriangle, Droplet, Shield } from 'lucide-react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { usePatientContext } from './PatientDrawer';

interface PatientDetailsProps {
  drawerProps?: DrawerContentComponentProps;
}

export function PatientDetails({ drawerProps }: PatientDetailsProps) {
  const { selectedPatient } = usePatientContext();

  const handleClose = () => {
    if (drawerProps?.navigation) {
      drawerProps.navigation.closeDrawer();
    }
  };

  const handleCall = () => {
    if (selectedPatient?.phone) {
      Linking.openURL(`tel:${selectedPatient.phone}`);
    }
  };

  const handleEmail = () => {
    if (selectedPatient?.email) {
      Linking.openURL(`mailto:${selectedPatient.email}`);
    }
  };

  if (!selectedPatient) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-gray-400 text-center">
          Select a patient to view details
        </Text>
      </View>
    );
  }

  const patient = selectedPatient;

  return (
    <View className="flex-1 bg-white">
      {/* Header with Close and Action Buttons */}
      <View className="flex-row justify-between items-center p-6 pb-4 border-b border-gray-100">
        <Pressable
          onPress={handleClose}
          className="w-10 h-10 items-center justify-center active:opacity-70"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={24} color="#000000" strokeWidth={2} />
        </Pressable>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
            onPress={handleCall}
          >
            <Phone size={20} color="#000000" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
            onPress={handleEmail}
          >
            <Mail size={20} color="#000000" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Patient Avatar and Info */}
        <View className="items-center mb-8 pt-6">
          <View
            className={`w-24 h-24 rounded-full items-center justify-center mb-4 bg-gray-900 overflow-hidden`}
          >
            {patient.profileImage ? (
              <Image source={{ uri: patient.profileImage }} className="w-full h-full" />
            ) : (
              <Text className="text-white text-3xl font-bold">
                {patient.initials}
              </Text>
            )}
          </View>

          <Text className="text-black text-2xl font-bold mb-1">
            {patient.name}
          </Text>
          <Text className="text-gray-500 text-sm">
            Patient ID: {patient.patientId}
          </Text>
        </View>

        {/* Visit Info Cards */}
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Text className="text-gray-500 text-xs font-semibold uppercase mb-2 tracking-wide">
              Last Visit
            </Text>
            <Text className="text-black text-lg font-bold">
              {patient.lastVisit}
            </Text>
          </View>

          <View className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Text className="text-gray-500 text-xs font-semibold uppercase mb-2 tracking-wide">
              Next Visit
            </Text>
            <Text className="text-black text-lg font-bold">
              {patient.nextVisit}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View className="mb-8">
          <Text className="text-black text-lg font-bold mb-4">
            Contact Information
          </Text>

          {patient.phone && (
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Phone size={18} color="#6B7280" strokeWidth={2} />
              </View>
              <View>
                <Text className="text-gray-500 text-xs">Phone</Text>
                <Text className="text-black font-medium">{patient.phone}</Text>
              </View>
            </View>
          )}

          {patient.email && (
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Mail size={18} color="#6B7280" strokeWidth={2} />
              </View>
              <View>
                <Text className="text-gray-500 text-xs">Email</Text>
                <Text className="text-black font-medium">{patient.email}</Text>
              </View>
            </View>
          )}

          {patient.address && (
            <View className="flex-row items-start">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3 mt-0.5">
                <MapPin size={18} color="#6B7280" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs">Address</Text>
                <Text className="text-black font-medium">{patient.address}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Medical Information */}
        <View className="mb-8">
          <Text className="text-black text-lg font-bold mb-4">
            Medical Information
          </Text>

          <View className="flex-row gap-3 mb-4">
            {patient.bloodType && (
              <View className="flex-1 bg-red-50 rounded-xl p-4 border border-red-100">
                <View className="flex-row items-center mb-2">
                  <Droplet size={16} color="#EF4444" strokeWidth={2} />
                  <Text className="text-red-600 text-xs font-semibold uppercase ml-2">Blood Type</Text>
                </View>
                <Text className="text-black text-xl font-bold">{patient.bloodType}</Text>
              </View>
            )}

            {patient.gender && (
              <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                <View className="flex-row items-center mb-2">
                  <Shield size={16} color="#3B82F6" strokeWidth={2} />
                  <Text className="text-blue-600 text-xs font-semibold uppercase ml-2">Gender</Text>
                </View>
                <Text className="text-black text-xl font-bold capitalize">{patient.gender}</Text>
              </View>
            )}
          </View>

          {patient.allergies && patient.allergies.length > 0 && (
            <View className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <View className="flex-row items-center mb-3">
                <AlertTriangle size={18} color="#F59E0B" strokeWidth={2} />
                <Text className="text-yellow-700 text-sm font-bold ml-2">Allergies</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <View key={index} className="bg-white px-3 py-1.5 rounded-full border border-yellow-200">
                    <Text className="text-yellow-700 text-sm font-medium">{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {patient.emergencyContact && (
            <View className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <Text className="text-gray-500 text-xs font-semibold uppercase mb-2 tracking-wide">
                Emergency Contact
              </Text>
              <Text className="text-black font-medium">{patient.emergencyContact}</Text>
            </View>
          )}
        </View>

        {/* Treatment History Section */}
        <View className="mb-8">
          <Text className="text-black text-lg font-bold mb-4">
            Treatment History
          </Text>

          {patient.treatmentHistory && patient.treatmentHistory.length > 0 ? (
            patient.treatmentHistory.map((item, index) => (
              <View
                key={index}
                className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-black text-base font-bold flex-1">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-gray-400 text-xs ml-2 font-medium">{item.date}</Text>
                    <View className={`ml-2 px-2 py-0.5 rounded-full ${item.status === 'confirmed' ? 'bg-green-100' :
                      item.status === 'pending' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                      <Text className={`text-xs font-medium capitalize ${item.status === 'confirmed' ? 'text-green-700' :
                        item.status === 'pending' ? 'text-yellow-700' :
                          'text-gray-700'
                        }`}>{item.status}</Text>
                    </View>
                  </View>
                </View>
                <Text className="text-gray-600 text-sm leading-5">
                  {item.description}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-400 text-sm">No treatment history available</Text>
          )}
        </View>

        <View className="h-4" />
      </ScrollView>
    </View>
  );
}

