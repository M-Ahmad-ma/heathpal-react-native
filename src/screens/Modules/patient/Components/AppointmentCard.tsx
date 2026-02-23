import { View, Text, TouchableOpacity } from 'react-native';
import { Appointment } from '../Screens/PatientAppointments';
import { Calendar, Clock, MapPin } from 'lucide-react-native';

interface AppointmentCardProps {
  item: Appointment;
  onViewDetails?: () => void;
  onReschedule?: () => void;
}

export const AppointmentCard = ({
  item,
  onViewDetails,
  onReschedule,
}: AppointmentCardProps) => {
  const isUpcoming = item.status === 'upcoming';

  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900 mb-0.5">
            {item.service}
          </Text>
          <Text className="text-xs text-gray-600">{item.doctorName}</Text>
        </View>
      </View>

      {/* Info */}
      <View className="gap-2 mb-3">
        <View className="flex-row items-center gap-2">
          <View
            className="w-7 h-7 rounded-lg items-center justify-center"
            style={{ backgroundColor: '#F6FEFC' }}
          >
            <Calendar size={14} color="#009689" />
          </View>
          <Text className="text-xs text-gray-700">{item.date}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View
            className="w-7 h-7 rounded-lg items-center justify-center"
            style={{ backgroundColor: '#F6FEFC' }}
          >
            <Clock size={14} color="#009689" />
          </View>
          <Text className="text-xs text-gray-700">{item.time}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View
            className="w-7 h-7 rounded-lg items-center justify-center"
            style={{ backgroundColor: '#F6FEFC' }}
          >
            <MapPin size={14} color="#009689" />
          </View>
          <Text className="text-xs text-gray-700">{item.location}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      {isUpcoming ? (
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 rounded-lg py-2.5 items-center"
            style={{ backgroundColor: '#009689' }}
            onPress={onViewDetails}
          >
            <Text className="text-white font-semibold text-xs">
              View Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-lg py-2.5 items-center border border-gray-200"
            onPress={onReschedule}
          >
            <Text className="text-gray-700 font-semibold text-xs">
              Reschedule
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          className="rounded-lg px-3 py-2 flex-row items-center justify-between"
          style={{ backgroundColor: '#F6FEFC' }}
        >
          <Text className="text-xs text-gray-600">Status</Text>
          <View className="flex-row items-center gap-1.5">
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#0D9D8F' }}
            />
            <Text className="text-xs font-medium text-gray-900 capitalize">
              {item.status}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};
