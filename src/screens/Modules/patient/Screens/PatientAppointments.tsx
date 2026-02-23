import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Star, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../../context/AuthContext';
import { api, showApiError } from '../../../../services/api';
import { usePatientUI, Doctor } from '../Components/PatientUIContext';

/* =======================
    Types
======================= */

export interface Appointment {
  id: string;
  patientId?: string;
  doctorId: string;
  doctorName: string;
  service: string;
  date: string;
  time: string;
  duration?: number;
  type?: 'in-person' | 'video';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'scheduled' | 'upcoming';
  location?: string;
  medicalCenterId?: string;
  notes?: string;
  totalAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  image?: string;
  rawDate?: string;
  rawTime?: string;
  bgColor?: string;
}

interface DoctorDetails {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  bio?: string;
  education?: string[];
  services?: string[];
  rating?: number;
  reviewCount?: number;
  image?: string;
  experience?: string;
  location?: string;
  languages?: string[];
}

/* =======================
   Helpers
======================= */

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatTime = (timeStr: string) => {
  try {
    const [h, m] = timeStr.split(':');
    const hour = Number(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
};

/* =======================
    Status normalization
======================= */

const normalizeStatus = (
  backendStatus: string,
  date: string,
  time: string
): 'upcoming' | 'completed' | 'cancelled' => {
  // Explicit cancelled status
  if (backendStatus === 'cancelled') return 'cancelled';

  // Create full datetime for comparison
  const appointmentDateTime = new Date(`${date}T${time}`);
  const now = new Date();

  // If appointment is in the past and not cancelled, mark as completed
  if (appointmentDateTime < now) {
    return 'completed';
  }

  // Future appointments (pending, confirmed, scheduled, rescheduled) are all "upcoming"
  return 'upcoming';
};

/* =======================
   Get display status with full logic
======================= */

const getDisplayStatus = (
  backendStatus: string,
  date: string,
  time: string
): 'upcoming' | 'completed' | 'cancelled' => {
  return normalizeStatus(backendStatus, date, time);
};

/* =======================
   Skeleton + Image
======================= */

const SkeletonLoader = ({
  width,
  height,
}: {
  width: number | string;
  height: number;
}) => <View style={{ width, height }} className="bg-gray-200 rounded-xl" />;

const ImageWithSkeleton = ({
  uri,
  bgColor,
}: {
  uri: string;
  bgColor?: string;
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <View className="w-24 h-24 rounded-2xl overflow-hidden" style={{ backgroundColor: bgColor }}>
      {loading && <SkeletonLoader width="100%" height={96} />}
      <Image
        source={{ uri }}
        resizeMode="cover"
        style={{ width: 96, height: 96, opacity: loading ? 0 : 1 }}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

/* =======================
    Status Badge Component
======================= */

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', bgColor: 'bg-green-50', textColor: 'text-green-700' };
      case 'cancelled':
        return { label: 'Cancelled', bgColor: 'bg-red-50', textColor: 'text-red-700' };
      case 'pending':
        return { label: 'Pending', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' };
      case 'confirmed':
        return { label: 'Confirmed', bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
      case 'scheduled':
        return { label: 'Scheduled', bgColor: 'bg-purple-50', textColor: 'text-purple-700' };
      case 'rescheduled':
        return { label: 'Rescheduled', bgColor: 'bg-orange-50', textColor: 'text-orange-700' };
      case 'upcoming':
        return { label: 'Upcoming', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' };
      default:
        return { label: status, bgColor: 'bg-gray-50', textColor: 'text-gray-700' };
    }
  };

  const config = getStatusConfig();

  return (
    <View className={`${config.bgColor} px-3 py-1 rounded-full self-start`}>
      <Text className={`${config.textColor} text-xs font-medium`}>
        {config.label}
      </Text>
    </View>
  );
};

/* =======================
   Cards
======================= */

const AppointmentBase = ({
  appointment,
  children,
  onDoctorPress,
}: any) => (
  <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-200" style={{ shadowColor: "#000", elevation: 3 }}>
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-sm font-semibold text-gray-900">
        {appointment.date} • {appointment.time}
      </Text>
      <StatusBadge status={appointment.status} />
    </View>

      <TouchableOpacity
        className="flex-row mb-4"
        activeOpacity={0.7}
        onPress={() => onDoctorPress(appointment)}
      >
        <ImageWithSkeleton uri={appointment.image || ''} bgColor={appointment.bgColor} />

        <View className="flex-1 ml-3 justify-center">
          <Text className="font-bold text-base text-gray-900">
            {appointment.doctorName}
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            {appointment.service}
          </Text>
          <View className="flex-row items-center mb-1">
            <Calendar size={14} color="#6B7280" />
            <Text className="text-xs ml-1 text-gray-500">
              {appointment.date} • {appointment.time}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={14} color="#6B7280" />
            <Text className="text-xs ml-1 text-gray-500">
              {appointment.location}
            </Text>
          </View>
          {appointment.type && (
            <View className="flex-row items-center mt-1">
              <Text className="text-xs ml-1 text-gray-400">
                Type: {appointment.type === 'in-person' ? 'In-Person' : 'Video'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

    {children}
  </View>
);

/* =======================
   Screen
======================= */

export const PatientAppointments = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { openDoctorDrawer } = usePatientUI();

  const [selectedTab, setSelectedTab] =
    useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [completed, setCompleted] = useState<Appointment[]>([]);
  const [cancelled, setCancelled] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Using refs for synchronous access to doctor data
  const doctorMapRef = useRef<Record<string, DoctorDetails>>({});

  const fetchAllDoctors = async (): Promise<Record<string, DoctorDetails>> => {
    try {
      console.log('Fetching all doctors using api.getDoctors()...');
      const res = await api.getDoctors({ limit: 100 });
      console.log('Doctors response structure:', res);

      // Handle different response structures
      let doctorsList: any[] = [];

      if (res?.success && res.data) {
        if (Array.isArray(res.data)) {
          doctorsList = res.data;
        } else if (res.data.doctors && Array.isArray(res.data.doctors)) {
          doctorsList = res.data.doctors;
        } else if (typeof res.data === 'object') {
          // Single doctor object
          doctorsList = [res.data];
        }
      }

      console.log('Processed doctorsList length:', doctorsList.length);

      // Build doctor map for synchronous access
      const map: Record<string, DoctorDetails> = {};
      doctorsList.forEach(doctor => {
        if (doctor && doctor.id) {
          map[doctor.id] = {
            id: doctor.id,
            fullName: doctor.fullName || doctor.name || `Doctor ${doctor.id}`,
            email: doctor.email || '',
            specialty: doctor.specialty || doctor.service || 'General Practitioner',
            bio: doctor.bio,
            education: doctor.education || [],
            services: doctor.services || [],
            rating: doctor.rating || 0,
            reviewCount: doctor.reviewCount || 0,
            image: doctor.image || doctor.profileImage,
            experience: doctor.experience,
            location: doctor.location,
            languages: doctor.languages || [],
          };
        }
      });

      // Update the ref synchronously
      doctorMapRef.current = map;

      console.log('Doctor map created with IDs:', Object.keys(map));
      return map;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      showApiError(error);
      return {};
    }
  };
  /* =======================
     Get doctor details by ID from ref
  ======================= */

  const getDoctorById = (doctorId: string): DoctorDetails | undefined => {
    return doctorMapRef.current[doctorId];
  };

  /* =======================
     Create UI doctor object
  ======================= */

  const createUIDoctor = (doctor: DoctorDetails, appointment: Appointment): Doctor => ({
    id: doctor.id,
    name: doctor.fullName,
    image: doctor.image || appointment.image,
    specialty: doctor.specialty || appointment.service,
    rating: doctor.rating || 0,
    experience: doctor.experience || '',
    location: appointment.location || doctor.location || 'Clinic',
    languages: doctor.languages || [],
    education: doctor.education || [],
    bio: doctor.bio || '',
    services: doctor.services || [],
    available: true,
    availability: ['Monday-Friday, 08.00 AM-18.00 PM'],
    reviews: `${doctor.reviewCount || 0} Reviews`,
    bgColor: ['#F8BBD0', '#FFCC80', '#A5D6A7', '#CE93D8'][Math.floor(Math.random() * 4)],
    reviewsArray: [
      {
        id: `review_${doctor.id}_1`,
        name: 'Patient',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        rating: Math.round(doctor.rating || 4),
        comment: 'Great experience! The doctor was very professional and caring.',
      },
    ],
  });

  /* =======================
   Fetch appointments and doctors in parallel - FIXED VERSION
======================= */

  const fetchAppointments = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);

      console.log('Starting to fetch appointments and doctors...');

      // Fetch doctors and appointments in parallel
      const [doctorsMap, appointmentsRes] = await Promise.all([
        fetchAllDoctors(),
        api.getAppointments()
      ]);

      const raw = appointmentsRes?.data ?? [];

      console.log('raw:', raw);


      console.log('Appointments raw data:', raw.length, 'appointments');
      console.log('Doctors map has keys:', Object.keys(doctorsMap));

      const mapped: Appointment[] = raw.map((appt: any) => {
        // Use doctorsMap directly instead of getDoctorById which uses the ref
        const doctor = doctorsMap[appt.doctorId];
        const status = normalizeStatus(appt.status || 'confirmed', appt.date, appt.time);

        console.log(`Appointment ${appt.id}: doctorId=${appt.doctorId}, doctor found=${!!doctor}`);

        // Use doctor's data if available, otherwise use appointment data
        const doctorName = doctor?.fullName || appt.doctorName || `Dr. ${appt.doctorId}`;
        const doctorImage = doctor?.image || doctor?.profileImage || appt.image || 'https://via.placeholder.com/100';

        return {
          id: appt.id,
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          doctorName: doctorName,
          service: appt.service || doctor?.specialty || 'General Consultation',
          date: formatDate(appt.date),
          time: formatTime(appt.time),
          duration: appt.duration,
          type: appt.type,
          status,
          location: appt.location || appt.medicalCenterName || doctor?.location || 'Clinic',
          medicalCenterId: appt.medicalCenterId,
          notes: appt.notes,
          totalAmount: appt.totalAmount,
          paymentStatus: appt.paymentStatus,
          image: doctorImage,
          rawDate: appt.date,
          rawTime: appt.time,
          bgColor: ['#A5D6A7', '#81D4FA', '#F8BBD0', '#FFCC80'][
            Math.floor(Math.random() * 4)
          ],
        };
      });

      // Log mapping results for debugging
      console.log('Mapped appointments:', mapped.length);
      console.log('Upcoming appointments:', mapped.filter(a => ['upcoming', 'confirmed', 'scheduled', 'pending', 'rescheduled'].includes(a.status)).length);
      console.log('Completed appointments:', mapped.filter(a => a.status === 'completed').length);
      console.log('Cancelled appointments:', mapped.filter(a => a.status === 'cancelled').length);

      // Sort appointments by status and date
      const sortedMapped = mapped.sort((a, b) => {
        // First sort by status priority
        const statusPriority = { upcoming: 0, pending: 1, confirmed: 2, scheduled: 3, rescheduled: 4, completed: 5, cancelled: 6 };
        const statusDiff = statusPriority[a.status as keyof typeof statusPriority] - statusPriority[b.status as keyof typeof statusPriority];

        if (statusDiff !== 0) return statusDiff;

        // Then sort by date/time within same status
        const dateA = new Date(`${a.rawDate || a.date}T${a.rawTime || a.time}`);
        const dateB = new Date(`${b.rawDate || b.date}T${b.rawTime || b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

      // Set all states
      setUpcoming(sortedMapped.filter(a => ['upcoming', 'confirmed', 'scheduled', 'pending', 'rescheduled'].includes(a.status)));
      setCompleted(sortedMapped.filter(a => a.status === 'completed'));
      setCancelled(sortedMapped.filter(a => a.status === 'cancelled'));
    } catch (e) {
      console.error('Error fetching appointments:', e);
      showApiError(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);

  /* =======================
     Button Handlers
  ======================= */

  const handleAddReview = (appointment: Appointment) => {
    Alert.alert(
      'Add Review',
      `Would you like to rate your experience with ${appointment.doctorName}?`,
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Yes, Add Review',
          onPress: () => {
            navigation.navigate('AddReview', {
              doctorId: appointment.doctorId,
              doctorName: appointment.doctorName,
              appointmentId: appointment.id,
            });
          },
        },
      ],
    );
  };

  const handleReBook = async (appointment: Appointment) => {
    let doctor = getDoctorById(appointment.doctorId);

    if (!doctor) {
      try {
        const res = await api.getDoctorDetails(appointment.doctorId);
        if (res?.data) {
          doctor = res.data;
          doctorMapRef.current = {
            ...doctorMapRef.current,
            [doctor.id]: doctor
          };
        }
      } catch (error) {
        console.log('Error fetching doctor for rebook:', error);
      }
    }

    if (!doctor) {
      // Fallback: navigate to BookAppointment with appointment data
      navigation.navigate('BookAppointment', {
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName || 'Unknown Doctor',
        service: appointment.service,
      });
      return;
    }

    const doctorForUI = createUIDoctor(doctor, appointment);
    navigation.navigate('BookAppointment', {
      doctorId: doctorForUI.id,
      doctorName: doctorForUI.name,
      service: doctorForUI.specialty,
    });
  };

  const handleDoctorPress = async (appointment: Appointment) => {
    console.log('Doctor pressed, doctorId:', appointment.doctorId);
    console.log('Current doctor ref keys:', Object.keys(doctorMapRef.current));

    // First check if we have the doctor in our ref
    let doctor = getDoctorById(appointment.doctorId);

    // If not in ref, try to fetch this specific doctor
    if (!doctor) {
      try {
        console.log('Doctor not found in ref, fetching specific doctor:', appointment.doctorId);
        const res = await api.getDoctorDetails(appointment.doctorId);

        if (res?.success && res.data) {
          doctor = res.data;
          console.log('Specific doctor fetched:', doctor);

          // Update our ref with this doctor
          doctorMapRef.current = {
            ...doctorMapRef.current,
            [doctor.id]: doctor
          };
        } else {
          console.error('Failed to fetch doctor details');
          Alert.alert('Error', 'Could not load doctor information. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Error fetching specific doctor:', error);
        showApiError(error);
        return;
      }
    }

    // If we have the doctor, open the drawer
    if (doctor) {
      const doctorForUI = createUIDoctor(doctor, appointment);
      console.log('Opening doctor drawer with:', doctorForUI);
      openDoctorDrawer(doctorForUI, 'appointments');
    } else {
      console.error('Doctor still not available after fetch attempt');
      Alert.alert('Error', 'Could not load doctor information. Please try again.');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await api.cancelAppointment(appointmentId);
      fetchAppointments();
      Alert.alert('Success', 'Appointment cancelled successfully.');
    } catch (error) {
      showApiError(error);
    }
  };

  const data =
    selectedTab === 'upcoming'
      ? upcoming
      : selectedTab === 'completed'
        ? completed
        : cancelled;

  /* =======================
     Render
  ======================= */

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-500">Loading appointments…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="border-b border-gray-200 px-5 py-4">
        <Text className="text-xl font-semibold text-center">My Bookings</Text>
      </View>

      <View className="flex-row px-5 border-b border-gray-200">
        {['upcoming', 'completed', 'cancelled'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab as any)}
            className="flex-1 py-3 items-center"
          >
            <Text
              className={`font-medium ${selectedTab === tab ? 'text-gray-900' : 'text-gray-400'
                }`}
            >
              {tab.toUpperCase()}
            </Text>
            {selectedTab === tab && (
              <View className="absolute bottom-0 h-0.5 w-full bg-gray-900" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="px-5 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAppointments(true)}
          />
        }
      >
        {data.length === 0 ? (
          <View className="items-center py-20">
            <Calendar size={40} color="#9CA3AF" />
            <Text className="mt-4 text-gray-500">
              No {selectedTab} appointments
            </Text>
          </View>
        ) : (
          data.map(appt => (
            <AppointmentBase
              key={appt.id}
              appointment={appt}
              onDoctorPress={() => handleDoctorPress(appt)}
            >
              {selectedTab === 'upcoming' && (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 py-3 rounded-full items-center"
                    onPress={() =>
                      Alert.alert(
                        'Cancel Appointment',
                        'Are you sure you want to cancel this appointment?',
                        [
                          { text: 'No', style: 'cancel' },
                          {
                            text: 'Yes',
                            style: 'destructive',
                            onPress: () => handleCancelAppointment(appt.id),
                          },
                        ],
                      )
                    }
                  >
                    <Text className="font-semibold">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-gray-900 py-3 rounded-full items-center"
                    onPress={() =>
                      navigation.navigate('Reschedule', {
                        appointmentId: appt.id,
                        doctorId: appt.doctorId,
                        currentDate: appt.rawDate || appt.date,
                        currentTime: appt.rawTime || appt.time,
                        doctorName: appt.doctorName,
                        service: appt.service,
                      })
                    }
                  >
                    <Text className="text-white font-semibold">Reschedule</Text>
                  </TouchableOpacity>
                </View>
              )}

              {(selectedTab === 'completed' || selectedTab === 'cancelled') && (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 py-3 rounded-full items-center flex-row justify-center"
                    onPress={() => handleAddReview(appt)}
                  >
                    <Star size={16} color="#6B7280" />
                    <Text className="font-semibold ml-2">Add Review</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-gray-900 py-3 rounded-full items-center flex-row justify-center"
                    onPress={() => handleReBook(appt)}
                  >
                    <RefreshCw size={16} color="#FFFFFF" />
                    <Text className="text-white font-semibold ml-2">Re-book</Text>
                  </TouchableOpacity>
                </View>
              )}
            </AppointmentBase>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
