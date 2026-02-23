import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Search, Plus, User, Calendar, AlertCircle, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { usePatientContext, Patient } from '../../../components/PatientDrawer';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const PatientCard = ({
  patient,
  onPress
}: {
  patient: Patient;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <View className="w-14 h-14 bg-black rounded-full mr-3 items-center justify-center overflow-hidden">
        {patient.profileImage ? (
          <Image source={{ uri: patient.profileImage }} className="w-full h-full" />
        ) : (
          <Text className="text-xl font-bold text-white">{patient.initials}</Text>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="font-bold text-base text-gray-900">{patient.name}</Text>
          {patient.hasAlert && (
            <View className="ml-2 bg-red-100 rounded-full p-1">
              <AlertCircle size={12} color="#EF4444" />
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-500">{patient.patientId}</Text>
        <View className="flex-row items-center mt-1">
          <Calendar size={12} color="#6B7280" />
          <Text className="text-xs text-gray-500 ml-1">Last visit: {patient.lastVisit}</Text>
        </View>
      </View>

      <ChevronRight size={20} color="#9CA3AF" />
    </View>

    <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
      <View className="flex-1 bg-blue-50 px-3 py-2 rounded-lg">
        <Text className="text-xs text-gray-500">Last Visit</Text>
        <Text className="text-sm font-semibold text-gray-900 mt-0.5">{patient.lastVisit}</Text>
      </View>
      <View className="flex-1 bg-green-50 px-3 py-2 rounded-lg">
        <Text className="text-xs text-gray-500">Treatments</Text>
        <Text className="text-sm font-semibold text-gray-900 mt-0.5">{patient.treatmentCount || patient.treatmentHistory?.length || 0}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export const Patients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const { setSelectedPatient } = usePatientContext();
  const { user } = useAuth();

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const doctorId = user?.id;
      console.log('Fetching patients for doctor ID:', doctorId);
      console.log('User object:', JSON.stringify(user));
      
      if (!doctorId) {
        throw new Error('Doctor ID not found');
      }
      
      const response = await api.getDoctorPatients(doctorId);
      console.log('API Response success:', response.success, 'data length:', response.data?.length);
      
      if (response.data && Array.isArray(response.data)) {
        setPatientsData(response.data);
        console.log('Set patients data:', response.data.length, 'patients');
      } else {
        console.log('Invalid response format:', response);
        setError('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setError(error.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patientsData.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePatientPress = (patient: Patient) => {
    setSelectedPatient(patient);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-3 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">Patients</Text>
              <Text className="text-sm text-gray-500 mt-1">{patientsData.length} total patients</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="bg-gray-50 rounded-xl px-4 py-1 flex-row items-center border border-gray-200">
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              className="flex-1 ml-3 text-gray-900 text-base"
              placeholder="Search patients by name or ID..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Patients List */}
        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          {loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#000000" />
              <Text className="text-gray-500 mt-2">Loading patients...</Text>
            </View>
          ) : error ? (
            <View className="items-center justify-center py-12">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <AlertCircle size={32} color="#EF4444" />
              </View>
              <Text className="text-red-500 text-base font-medium">Error</Text>
              <Text className="text-gray-500 text-sm mt-1">{error}</Text>
              <TouchableOpacity 
                className="mt-4 bg-black px-6 py-2 rounded-xl"
                onPress={fetchPatients}
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onPress={() => handlePatientPress(patient)}
              />
            ))
          ) : (
            <View className="items-center justify-center py-12">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                <User size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-base font-medium">No patients found</Text>
              <Text className="text-gray-400 text-sm mt-1">Try adjusting your search</Text>
            </View>
          )}

          <View className="h-4" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
