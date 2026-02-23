import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Calendar, FileText, Clock } from 'lucide-react-native';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../services/api';

interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  type: string;
  description: string;
  status: string;
  results?: string;
  notes?: string;
  doctor?: string;
  service?: string;
}

export const MedicalRecords = () => {
  const [pastAppointments, setPastAppointments] = useState<MedicalRecord[]>([]);
  const [treatments, setTreatments] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await api.getMyMedicalHistory();

      if (response?.data && Array.isArray(response.data)) {
        // Assuming data has merged records or we filter them based on type or status
        // For this mock implementation, let's say 'Treatment' and 'Surgery' are treatments
        // and others are appointments
        const data = response.data;

        // This logic depends on what exactly the mock API returns. 
        // Based on the mock controller I just wrote:
        setTreatments(data.filter((record: any) => record.type === 'Treatment' || record.type === 'Surgery'));

        // We can also fetch actual past appointments separately if needed
        const appointmentsResponse = await api.getAppointments({ status: 'completed' });
        if (appointmentsResponse?.data && Array.isArray(appointmentsResponse.data)) {
          const mappedAppointments = appointmentsResponse.data.map((appt: any) => ({
            id: appt.id,
            title: appt.service,
            date: appt.date,
            type: 'Appointment',
            description: appt.service,
            status: appt.status,
            doctor: appt.doctorName || 'Unknown Doctor',
            service: appt.service,
            notes: appt.notes
          }));
          setPastAppointments(mappedAppointments);
        }
      }
    } catch (error) {
      console.log('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 py-4 bg-white border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">
            Medical Records
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            View your dental history and treatments
          </Text>
        </View>

        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#1F2937" />
            <Text className="text-gray-500 mt-4">Loading records...</Text>
          </View>
        ) : (
          <>
            {/* Past Appointments Section */}
            <View className="px-5 py-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Past Appointments
              </Text>

              {pastAppointments.length > 0 ? (
                pastAppointments.map(appointment => (
                  <View
                    key={appointment.id}
                    className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900">
                          {appointment.service}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {appointment.doctor}
                        </Text>
                      </View>
                      <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-lg">
                        <Calendar size={12} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1">
                          {appointment.date}
                        </Text>
                      </View>
                    </View>

                    {appointment.notes && (
                      <View className="flex-row items-start gap-2 bg-gray-50 p-3 rounded-lg">
                        <FileText size={16} color="#6B7280" />
                        <Text className="text-sm text-gray-600 flex-1">
                          {appointment.notes}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 italic mb-4">No past appointments found</Text>
              )}
            </View>

            {/* Treatment History Section */}
            <View className="px-5 py-4 pb-8">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Treatment History
              </Text>

              {treatments.length > 0 ? (
                treatments.map((treatment, index) => (
                  <View key={treatment.id || index} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-lg font-semibold text-gray-800">{treatment.title}</Text>
                      <Text className="text-sm text-gray-500">{treatment.date}</Text>
                    </View>
                    <View className="mb-2">
                      <Text className="text-sm text-gray-500 font-medium mb-1">Description:</Text>
                      <Text className="text-sm text-gray-600 mb-2">{treatment.description}</Text>
                    </View>
                    {treatment.results && (
                      <View className="bg-green-50 p-2 rounded-lg mb-2">
                        <Text className="text-sm text-green-700 font-medium">Results: {treatment.results}</Text>
                      </View>
                    )}
                    {treatment.notes && (
                      <View className="flex-row items-start gap-2">
                        <Text className="text-sm text-gray-500 font-medium">Notes:</Text>
                        <Text className="text-sm text-gray-600 flex-1">{treatment.notes}</Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 italic">No treatment history found</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MedicalRecords;
