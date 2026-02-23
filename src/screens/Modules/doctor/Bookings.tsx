import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Video, MessageCircle, User, X, Check, Phone, Mail } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { api } from '../../../services/api';

interface BackendAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  type: 'in-person' | 'video';
  status: string;
  notes?: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  patients?: {
    id: string;
    date_of_birth?: string;
    users?: {
      full_name?: string;
      profile_image?: string;
      phone?: string;
      email?: string;
    };
  };
}

interface AppointmentCardProps {
  time: string;
  doctorName: string;
  specialty: string;
  type: 'in-person' | 'video';
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  image?: string;
  appointmentId?: string;
  appointmentData?: BackendAppointment;
  onReschedule?: (id: string, currentDate: string, currentTime: string) => void;
  onDetail?: (appointment: BackendAppointment) => void;
}

const AppointmentCard = ({
  time,
  doctorName,
  specialty,
  type,
  status,
  image,
  appointmentId,
  appointmentData,
  onReschedule,
  onDetail,
}: AppointmentCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-600';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const handleChatPress = () => {
    Alert.alert(
      'Coming Soon',
      'Chat functionality will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row items-center mb-3">
        <View className="w-14 h-14 bg-gray-200 rounded-full mr-3 overflow-hidden">
          {image ? (
            <Image source={{ uri: image }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-black items-center justify-center">
              <Text className="text-xl font-bold text-white">
                {doctorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="font-bold text-base text-gray-900">{doctorName}</Text>
          <Text className="text-sm text-gray-500">{specialty}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor()}`}>
          <Text className="text-xs font-medium">{status}</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <Calendar size={16} color="#6B7280" />
        <Text className="text-sm text-gray-600 ml-2">{time.split(' - ')[0]}</Text>
      </View>

      <View className="flex-row items-center mb-3">
        <Clock size={16} color="#6B7280" />
        <Text className="text-sm text-gray-600 ml-2">{time}</Text>
      </View>

      <View className="flex-row items-center mb-4">
        {type === 'in-person' ? (
          <>
            <MapPin size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">In-Person Visit</Text>
          </>
        ) : (
          <>
            <Video size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">Video Consultation</Text>
          </>
        )}
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity 
          className="flex-1 bg-black py-3 rounded-xl items-center"
          onPress={() => appointmentData && onDetail && onDetail(appointmentData)}
        >
          <Text className="text-white font-semibold text-sm">Detail</Text>
        </TouchableOpacity>
        {status !== 'COMPLETED' && status !== 'CANCELLED' && onReschedule && appointmentId && (
          <TouchableOpacity
            className="bg-gray-100 px-4 py-3 rounded-xl items-center justify-center"
            onPress={() => {
              const datePart = time.split(' - ')[0];
              onReschedule(appointmentId, datePart, time);
            }}
          >
            <Text className="text-gray-700 font-semibold text-sm">Reschedule</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          className="bg-gray-100 px-4 py-3 rounded-xl items-center justify-center"
          onPress={handleChatPress}
        >
          <MessageCircle size={18} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <View className="mb-3 mt-2">
    <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
      {title}
    </Text>
  </View>
);

const mockAppointments: { today: AppointmentCardProps[]; tomorrow: AppointmentCardProps[]; may22: AppointmentCardProps[] } = {
  today: [
    {
      time: '09:00 AM - 10:00 AM',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Dental Specialist',
      type: 'in-person',
      status: 'CONFIRMED',
    },
    {
      time: '11:30 AM - 12:30 PM',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      type: 'video',
      status: 'PENDING',
    },
    {
      time: '02:00 PM - 03:00 PM',
      doctorName: 'Dr. Alice Brown',
      specialty: 'General Physician',
      type: 'in-person',
      status: 'CONFIRMED',
    },
  ],
  tomorrow: [
    {
      time: '09:00 AM - 10:00 AM',
      doctorName: 'Dr. Robert Wilson',
      specialty: 'Orthopedic',
      type: 'in-person',
      status: 'CONFIRMED',
    },
    {
      time: '11:30 AM - 12:30 PM',
      doctorName: 'Dr. Emily Davis',
      specialty: 'Dermatologist',
      type: 'video',
      status: 'PENDING',
    },
  ],
  may22: [
    {
      time: '09:00 AM - 10:00 AM',
      doctorName: 'Dr. James Miller',
      specialty: 'ENT Specialist',
      type: 'in-person',
      status: 'COMPLETED',
    },
    {
      time: '02:00 PM - 03:00 PM',
      doctorName: 'Dr. Maria Garcia',
      specialty: 'Pediatrician',
      type: 'video',
      status: 'COMPLETED',
    },
  ],
};

export const Bookings = () => {
  const [appointments, setAppointments] = useState<BackendAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{ id: string; date: string; time: string } | null>(null);
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState<BackendAppointment | null>(null);
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState(new Date());
  const [rescheduling, setRescheduling] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      console.log('Fetching appointments...');
      // Always use doctor_1 for mock data
      const response = await api.getAppointments({ includePatientDetails: true });
      console.log('Appointments response success:', response.success, 'data length:', response.data?.length);
      if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
        console.log('Set appointments:', response.data.length);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = (appointmentId: string, currentDate: string, currentTime: string) => {
    setSelectedAppointment({ id: appointmentId, date: currentDate, time: currentTime });
    const now = new Date();
    setNewDate(now);
    setNewTime(now);
    setDateError('');
    setTimeError('');
    setRescheduleModalVisible(true);
  };

  const handleDetail = (appointment: BackendAppointment) => {
    setSelectedAppointmentDetail(appointment);
    setDetailModalVisible(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setDateError('Please select a future date');
      } else {
        setNewDate(selectedDate);
        setDateError('');
      }
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setNewTime(selectedTime);
      setTimeError('');
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (date: Date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const validateAndSubmit = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newDate < today) {
      setDateError('Please select a future date');
      return;
    }

    submitReschedule();
  };

  const submitReschedule = async () => {
    if (!selectedAppointment) return;

    setRescheduling(true);
    try {
      const formattedDate = formatDate(newDate);
      const formattedTime = formatTime(newTime);
      await api.rescheduleAppointment(selectedAppointment.id, formattedDate, formattedTime);
      Alert.alert('Success', 'Appointment rescheduled successfully');
      setRescheduleModalVisible(false);
      fetchAppointments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reschedule appointment');
    } finally {
      setRescheduling(false);
    }
  };

  const transformToDisplay = (appt: BackendAppointment): AppointmentCardProps => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    let displayTime = '';
    if (appt.date === today) {
      displayTime = 'TODAY';
    } else if (appt.date === tomorrow) {
      displayTime = 'TOMORROW';
    } else {
      displayTime = appt.date;
    }

    const patient = appt.patients?.users || {};
    const patientName = patient.full_name || `Patient ${appt.patientId?.slice(-4) || 'Unknown'}`;
    const patientImage = patient.profile_image;

    // Determine display status based on time
    const apptDateTime = new Date(`${appt.date}T${appt.time}`);
    const now = new Date();
    let displayStatus: 'CONFIRMED' | 'PENDING' | 'COMPLETED' = 'PENDING';

    if (appt.status === 'cancelled') {
      displayStatus = 'CANCELLED' as any;
    } else if (apptDateTime < now) {
      displayStatus = 'COMPLETED';
    } else if (appt.status === 'confirmed') {
      displayStatus = 'CONFIRMED';
    }

    return {
      time: `${displayTime} - ${appt.time}`,
      doctorName: patientName,
      specialty: appt.service,
      type: appt.type,
      status: displayStatus,
      appointmentId: appt.id,
      image: patientImage,
    };
  };

  const isUpcoming = (appt: BackendAppointment) => {
    const apptDate = new Date(`${appt.date} ${appt.time}`);
    return apptDate >= new Date() && appt.status !== 'cancelled';
  };

  const displayAppointments = appointments.length > 0
    ? appointments.filter(isUpcoming).map(transformToDisplay)
    : [];

  const todayAppointments = displayAppointments.filter(a => a.time.includes('TODAY'));
  const tomorrowAppointments = displayAppointments.filter(a => a.time.includes('TOMORROW'));
  const otherAppointments = displayAppointments.filter(a => !a.time.includes('TODAY') && !a.time.includes('TOMORROW'));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-3 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold text-medium text-gray-900">
              My Appointments
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          {loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#000000" />
              <Text className="text-gray-500 mt-2">Loading appointments...</Text>
            </View>
          ) : displayAppointments.length > 0 ? (
            <>
              {todayAppointments.length > 0 && (
                <>
                  <SectionHeader title="TODAY" />
                  {todayAppointments.map((appointment, index) => {
                    const originalAppt = appointments.find(a => a.id === appointment.appointmentId);
                    return (
                      <AppointmentCard
                        key={`today-${index}`}
                        time={appointment.time}
                        doctorName={appointment.doctorName}
                        specialty={appointment.specialty}
                        type={appointment.type}
                        status={appointment.status}
                        appointmentId={appointment.appointmentId}
                        image={appointment.image}
                        appointmentData={originalAppt}
                        onReschedule={handleReschedule}
                        onDetail={handleDetail}
                      />
                    );
                  })}
                </>
              )}

              {tomorrowAppointments.length > 0 && (
                <>
                  <SectionHeader title="TOMORROW" />
                  {tomorrowAppointments.map((appointment, index) => {
                    const originalAppt = appointments.find(a => a.id === appointment.appointmentId);
                    return (
                      <AppointmentCard
                        key={`tomorrow-${index}`}
                        time={appointment.time}
                        doctorName={appointment.doctorName}
                        specialty={appointment.specialty}
                        type={appointment.type}
                        status={appointment.status}
                        appointmentId={appointment.appointmentId}
                        image={appointment.image}
                        appointmentData={originalAppt}
                        onReschedule={handleReschedule}
                        onDetail={handleDetail}
                      />
                    );
                  })}
                </>
              )}

              {otherAppointments.length > 0 && (
                <>
                  <SectionHeader title="UPCOMING" />
                  {otherAppointments.map((appointment, index) => {
                    const originalAppt = appointments.find(a => a.id === appointment.appointmentId);
                    return (
                      <AppointmentCard
                        key={`upcoming-${index}`}
                        time={appointment.time}
                        doctorName={appointment.doctorName}
                        specialty={appointment.specialty}
                        type={appointment.type}
                        status={appointment.status}
                        appointmentId={appointment.appointmentId}
                        image={appointment.image}
                        appointmentData={originalAppt}
                        onReschedule={handleReschedule}
                        onDetail={handleDetail}
                      />
                    );
                  })}
                </>
              )}
            </>
          ) : (
            <View className="py-12 items-center">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                <Calendar size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-base font-medium">No upcoming appointments</Text>
              <Text className="text-gray-400 text-sm mt-1">Your upcoming appointments will appear here</Text>
            </View>
          )}

          <View className="h-4" />
        </ScrollView>
      </View>

      {/* Reschedule Modal */}
      <Modal
        visible={rescheduleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-5">
          <View className="bg-white rounded-2xl w-full p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-black">Reschedule Appointment</Text>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-gray-500 mb-2">New Date</Text>
            <TouchableOpacity
              className={`bg-gray-50 rounded-xl px-4 py-3 mb-4 border ${dateError ? 'border-red-500' : 'border-gray-200'} flex-row items-center`}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#6B7280" />
              <Text className="flex-1 ml-3 text-base text-black">{formatDate(newDate)}</Text>
            </TouchableOpacity>
            {dateError ? <Text className="text-red-500 text-xs mb-3">{dateError}</Text> : null}

            <Text className="text-sm text-gray-500 mb-2">New Time</Text>
            <TouchableOpacity
              className={`bg-gray-50 rounded-xl px-4 py-3 mb-6 border ${timeError ? 'border-red-500' : 'border-gray-200'} flex-row items-center`}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color="#6B7280" />
              <Text className="flex-1 ml-3 text-base text-black">{formatTime(newTime)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={newTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
                is24Hour={true}
              />
            )}

            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${rescheduling ? 'bg-gray-400' : 'bg-black'}`}
              onPress={validateAndSubmit}
              disabled={rescheduling}
            >
              {rescheduling ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">Confirm Reschedule</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <TouchableOpacity 
            className="flex-1" 
            onPress={() => setDetailModalVisible(false)}
            activeOpacity={1}
          />
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-black">Appointment Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedAppointmentDetail && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Patient Info */}
                <View className="flex-row items-center mb-6">
                  <View className="w-16 h-16 bg-gray-200 rounded-full mr-4 overflow-hidden">
                    {selectedAppointmentDetail.patients?.users?.profile_image ? (
                      <Image 
                        source={{ uri: selectedAppointmentDetail.patients.users.profile_image }} 
                        className="w-full h-full" 
                      />
                    ) : (
                      <View className="w-full h-full bg-black items-center justify-center">
                        <Text className="text-xl font-bold text-white">
                          {selectedAppointmentDetail.patients?.users?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'NA'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-900">
                      {selectedAppointmentDetail.patients?.users?.full_name || 'Unknown Patient'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Patient ID: {selectedAppointmentDetail.patientId}
                    </Text>
                  </View>
                </View>

                {/* Status */}
                <View className={`px-4 py-2 rounded-full self-start mb-6 ${
                  selectedAppointmentDetail.status === 'confirmed' ? 'bg-green-100' :
                  selectedAppointmentDetail.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Text className={`font-medium ${
                    selectedAppointmentDetail.status === 'confirmed' ? 'text-green-700' :
                    selectedAppointmentDetail.status === 'pending' ? 'text-yellow-700' : 'text-gray-700'
                  }`}>
                    {selectedAppointmentDetail.status.toUpperCase()}
                  </Text>
                </View>

                {/* Service Info */}
                <View className="mb-6">
                  <Text className="text-gray-500 text-sm mb-1">Service</Text>
                  <Text className="text-lg font-semibold text-gray-900">{selectedAppointmentDetail.service}</Text>
                </View>

                {/* Date & Time */}
                <View className="flex-row mb-6">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-1">Date</Text>
                    <Text className="text-lg font-semibold text-gray-900">{selectedAppointmentDetail.date}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-1">Time</Text>
                    <Text className="text-lg font-semibold text-gray-900">{selectedAppointmentDetail.time}</Text>
                  </View>
                </View>

                {/* Duration & Type */}
                <View className="flex-row mb-6">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-1">Duration</Text>
                    <Text className="text-lg font-semibold text-gray-900">{selectedAppointmentDetail.duration} min</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-1">Type</Text>
                    <View className="flex-row items-center">
                      {selectedAppointmentDetail.type === 'in-person' ? (
                        <>
                          <MapPin size={16} color="#6B7280" />
                          <Text className="text-lg font-semibold text-gray-900 ml-1">In-Person</Text>
                        </>
                      ) : (
                        <>
                          <Video size={16} color="#6B7280" />
                          <Text className="text-lg font-semibold text-gray-900 ml-1">Video</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>

                {/* Payment Info */}
                <View className="flex-row mb-6">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-1">Amount</Text>
                    <Text className="text-lg font-semibold text-gray-900">${selectedAppointmentDetail.totalAmount}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-sm mb-1">Payment</Text>
                    <Text className={`text-lg font-semibold capitalize ${
                      selectedAppointmentDetail.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedAppointmentDetail.paymentStatus}
                    </Text>
                  </View>
                </View>

                {/* Notes */}
                {selectedAppointmentDetail.notes && (
                  <View className="mb-6">
                    <Text className="text-gray-500 text-sm mb-1">Notes</Text>
                    <View className="bg-gray-50 rounded-xl p-4">
                      <Text className="text-gray-700">{selectedAppointmentDetail.notes}</Text>
                    </View>
                  </View>
                )}

                {/* Contact Buttons */}
                {selectedAppointmentDetail.patients?.users && (
                  <View className="flex-row gap-3 mt-4">
                    {selectedAppointmentDetail.patients.users.phone && (
                      <TouchableOpacity 
                        className="flex-1 bg-black py-3 rounded-xl flex-row items-center justify-center"
                        onPress={() => {
                          Alert.alert('Coming Soon', 'Direct calling will be available soon.');
                        }}
                      >
                        <Phone size={18} color="white" />
                        <Text className="text-white font-semibold ml-2">Call</Text>
                      </TouchableOpacity>
                    )}
                    {selectedAppointmentDetail.patients.users.email && (
                      <TouchableOpacity 
                        className="flex-1 bg-black py-3 rounded-xl flex-row items-center justify-center"
                        onPress={() => {
                          Alert.alert('Coming Soon', 'Direct messaging will be available soon.');
                        }}
                      >
                        <Mail size={18} color="white" />
                        <Text className="text-white font-semibold ml-2">Message</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Bookings;
