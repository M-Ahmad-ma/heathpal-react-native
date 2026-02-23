import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Clock,
  Users,
  ClipboardList,
  Bell,
  X,
  Check,
  Calendar as CalendarIcon,
  Info,
} from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../../services/api';

interface AppointmentCardProps {
  time: string;
  patientName: string;
  patientAge: number;
  status: 'upcoming' | 'completed';
  condition: string;
  duration: string;
  isNext?: boolean;
}

const AppointmentCard = ({
  time,
  patientName,
  patientAge,
  status,
  condition,
  duration,
  isNext = false,
}: AppointmentCardProps) => {
  const navigation = useNavigation();

  const renderActions = () => {
    if (status === 'completed') {
      return (
        <View className="flex-row items-center gap-2 flex-wrap">
          <View className="bg-gray-100 px-3 py-2 rounded-xl flex-row items-center">
            <Text className="text-gray-500 text-xs font-medium ml-1.5">
              Completed
            </Text>
          </View>
          <TouchableOpacity
            className="bg-black px-3 py-2 rounded-xl"
            onPress={() => navigation.navigate('Bookings' as never)}
          >
            <Text className="text-white text-xs font-bold">DETAILS</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-row items-center gap-2 flex-wrap">
        <TouchableOpacity
          className="bg-gray-100 px-3 py-2 rounded-xl"
          onPress={() => navigation.navigate('Bookings' as never)}
        >
          <Text className="text-black text-xs font-bold">RESCHEDULE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black px-3 py-2 rounded-xl"
          onPress={() => navigation.navigate('Bookings' as never)}
        >
          <Text className="text-white text-xs font-bold">VIEW DETAILS</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      className={`rounded-2xl p-4 mb-3 border-2 ${isNext
        ? 'bg-black border-black'
        : status === 'completed'
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-200'
        }`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${isNext ? 'bg-white' : 'bg-black'
              }`}
          >
            <Text
              className={`text-lg font-bold ${isNext ? 'text-black' : 'text-white'
                }`}
            >
              {patientName
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1 flex-wrap">
              <Text
                className={`font-bold text-base ${isNext ? 'text-white' : 'text-black'
                  }`}
              >
                {patientName}
              </Text>
              <Text
                className={`text-sm ml-2 ${isNext ? 'text-gray-400' : 'text-gray-500'
                  }`}
              >
                · {patientAge}y
              </Text>
            </View>
            <Text
              className={`text-xs ${isNext ? 'text-gray-400' : 'text-gray-600'
                }`}
            >
              {condition}
            </Text>
          </View>
        </View>
        {isNext && (
          <View className="bg-white px-3 py-1 rounded-full ml-2">
            <Text className="text-black text-xs font-bold">NEXT</Text>
          </View>
        )}
      </View>

      <View
        className={`flex-wrap flex-row items-center pt-3 border-t ${isNext ? 'border-gray-800' : 'border-gray-200'
          }`}
      >
        <View className="flex-row items-center gap-4 flex-wrap flex-1">
          <View className="flex-row items-center">
            <Clock size={14} color={isNext ? '#9CA3AF' : '#6B7280'} />
            <Text
              className={`text-sm ml-1.5 font-medium ${isNext ? 'text-gray-400' : 'text-gray-600'
                }`}
            >
              {time}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 flex-wrap">
          {renderActions()}
        </View>
      </View>
    </View>
  );
};

const QuickAction = ({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity className="items-center" onPress={onPress}>
    <View className="w-16 h-16 rounded-2xl bg-black items-center justify-center mb-2">
      {icon}
    </View>
    <Text className="text-xs text-gray-700 text-center font-medium">
      {label}
    </Text>
  </TouchableOpacity>
);

interface BackendAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export const Hub = () => {
  const { user, accountType } = useAuth();
  const navigation = useNavigation();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotification();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
    if (user) {
      navigation.setOptions({
        headerShown: false,
      });
    }
  }, [user]);

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

  const handleNotificationPress = async (notification: typeof notifications[0]) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };


  console.log(user);


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon size={18} color="#10B981" />;
      case 'reminder':
        return <Clock size={18} color="#F59E0B" />;
      case 'system':
        return <Info size={18} color="#3B82F6" />;
      default:
        return <Bell size={18} color="#6B7280" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const isUpcoming = (appt: any) => {
    const apptDate = new Date(`${appt.date} ${appt.time}`);
    return apptDate >= new Date() && appt.status !== 'cancelled' && appt.status !== 'completed';
  };

  const upcomingAppointments = appointments.filter(isUpcoming);
  const todayAppointments = appointments.filter((appt: any) => appt.date === today && isUpcoming(appt));

  // Get upcoming stats only
  const upcomingCount = upcomingAppointments.length;
  const pendingCount = upcomingAppointments.filter((appt: any) => appt.status === 'pending').length;
  const confirmedCount = upcomingAppointments.filter((appt: any) => appt.status === 'confirmed').length;

  // Get unique patients from upcoming appointments
  const uniquePatientIds = new Set(upcomingAppointments.map((appt: any) => appt.patientId));
  const totalPatients = uniquePatientIds.size;

  const transformAppointment = (appt: any, index: number) => {
    const patient = appt.patients?.users || {};
    const patientName = patient.full_name || appt.patients?.full_name || `Patient ${appt.patientId?.slice(-4) || 'Unknown'}`;
    const patientAge = appt.patients?.date_of_birth
      ? Math.floor((new Date().getTime() - new Date(appt.patients.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 30;

    let status: 'upcoming' | 'completed' = 'upcoming';
    if (appt.status === 'pending') status = 'upcoming';
    else if (appt.status === 'confirmed') status = 'upcoming';
    else if (appt.status === 'completed') status = 'completed';

    // Format date for display
    const displayDate = new Date(`${appt.date} ${appt.time}`);
    let timeLabel = appt.time;
    if (appt.date === today) {
      timeLabel = `Today, ${appt.time}`;
    } else {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      if (appt.date === tomorrow) {
        timeLabel = `Tomorrow, ${appt.time}`;
      }
    }

    return {
      time: timeLabel,
      patientName,
      patientAge,
      status,
      condition: appt.service,
      duration: `${appt.duration || 30} min`,
      isNext: index === 0 && status !== 'completed',
      originalDate: appt.date,
      patientImage: patient.profile_image || appt.patients?.profile_image,
      doctor: appt.doctors?.users?.full_name || 'Doctor',
      doctorSpecialty: appt.doctors?.specialty || '',
      medicalCenter: appt.medical_centers?.name || appt.location || 'N/A',
    };
  };

  const displayAppointments = upcomingAppointments.length > 0
    ? upcomingAppointments.map((appt, index) => transformAppointment(appt, index))
    : [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-6 pb-5 bg-white">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden items-center justify-center mr-3">
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} className="w-full h-full" />
                ) : (
                  <Text className="text-lg font-bold text-gray-600">
                    {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : (user?.email ? user.email.split('@')[0].slice(0, 2).toUpperCase() : 'D')}
                  </Text>
                )}
              </View>
              <View>
                <Text className="text-sm text-gray-500 uppercase tracking-wider">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text className="text-xl font-bold text-black">
                  {user?.fullName || user?.email?.split('@')[0] || 'Doctor'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="relative w-11 h-11 rounded-xl bg-gray-100 items-center justify-center"
              onPress={() => setNotificationDrawerVisible(true)}
            >
              <Bell size={20} color="black" />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mb-5">
            <View className="bg-black p-5 rounded-3xl flex-1 mr-1.5">
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
                  <Clock size={22} color="white" />
                </View>
              </View>
              <Text className="text-3xl font-bold text-white mb-1">{upcomingCount || 0}</Text>
              <Text className="text-xs text-gray-400 uppercase tracking-wide">
                Upcoming Appointments
              </Text>
            </View>
            <View className="bg-black p-5 rounded-3xl flex-1 mx-1.5">
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
                  <Users size={22} color="white" />
                </View>
              </View>
              <Text className="text-3xl font-bold text-white mb-1">{totalPatients || 0}</Text>
              <Text className="text-xs text-gray-400 uppercase tracking-wide">
                Active Patients
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 py-5 bg-gray-50 border-y border-gray-200">
          <Text className="text-base font-bold text-black mb-4 uppercase tracking-wide text-xs">
            Quick Access
          </Text>
          <View className="flex-row justify-between">
            <QuickAction
              icon={<Calendar size={24} color="white" />}
              label="Schedule"
              onPress={() => navigation.navigate('Bookings' as never)}
            />
            <QuickAction
              icon={<Users size={24} color="white" />}
              label="Patients"
              onPress={() => navigation.navigate('Patients' as never)}
            />
            <QuickAction
              icon={<ClipboardList size={24} color="white" />}
              label="Records"
              onPress={() => navigation.navigate('Profile' as never)}
            />
          </View>
        </View>

        {/* Today's Appointments */}
        <View className="px-5 pt-6 bg-white">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-black">
              Today's Schedule
            </Text>
            <TouchableOpacity
              className="bg-black px-4 py-2 rounded-xl"
              onPress={() => navigation.navigate('Bookings' as never)}
            >
              <Text className="text-white text-xs font-bold">VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#000000" />
              <Text className="text-gray-500 mt-2">Loading appointments...</Text>
            </View>
          ) : displayAppointments.length > 0 ? (
            displayAppointments.map((appointment, index) => (
              <AppointmentCard
                key={index}
                time={appointment.time}
                patientName={appointment.patientName}
                patientAge={appointment.patientAge}
                status={appointment.status}
                condition={appointment.condition}
                duration={appointment.duration}
                isNext={appointment.isNext}
              />
            ))
          ) : (
            <View className="py-8 items-center">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                <Calendar size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-base font-medium">No upcoming appointments</Text>
              <Text className="text-gray-400 text-sm mt-1">Your upcoming appointments will appear here</Text>
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Notification Drawer */}
      <Modal
        visible={notificationDrawerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationDrawerVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <TouchableOpacity
            className="flex-1"
            onPress={() => setNotificationDrawerVisible(false)}
            activeOpacity={1}
          />

          <View className="bg-white rounded-t-3xl max-h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
              <View className="flex-row items-center">
                <Bell size={22} color="black" />
                <Text className="text-xl font-bold text-black ml-3">Notifications</Text>
                {unreadCount > 0 && (
                  <View className="bg-red-500 px-2 py-0.5 rounded-full ml-2">
                    <Text className="text-white text-xs font-bold">{unreadCount}</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center">
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={handleMarkAllAsRead} className="mr-4">
                    <Text className="text-blue-500 text-sm font-medium">Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setNotificationDrawerVisible(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications List */}
            {notifications.length === 0 ? (
              <View className="py-12 items-center px-5">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Bell size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 text-lg font-semibold mb-1">No notifications</Text>
                <Text className="text-gray-500 text-center">You're all caught up! Check back later for updates.</Text>
              </View>
            ) : (
              <ScrollView className="max-h-[60vh]" showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    className={`flex-row p-4 border-b border-gray-50 active:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                      {getNotificationIcon(notification.type)}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className={`font-semibold text-base ${!notification.read ? 'text-black' : 'text-gray-700'}`}>
                          {notification.title}
                        </Text>
                        <Text className="text-xs text-gray-400">{formatTime(notification.createdAt)}</Text>
                      </View>
                      <Text className="text-gray-600 text-sm" numberOfLines={2}>
                        {notification.message}
                      </Text>
                    </View>
                    {!notification.read && (
                      <View className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Hub;
