import { Text, View, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';

export const AppointmentCard = ({ time, name, service, status }) => {
  const getStatusColor = status => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-600';
      case 'pending':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm">
      {/* Clock Icon */}
      <View className="w-10 h-10 rounded-full border-2 border-gray-200 items-center justify-center mr-3">
        <Clock size={20} color="#9CA3AF" strokeWidth={2} />
      </View>

      {/* Appointment Details */}
      <View className="flex-1">
        <Text className="text-[#009689] text-xs font-semibold mb-1">
          {time}
        </Text>
        <Text className="text-gray-900 text-base font-bold mb-0.5">{name}</Text>
        <Text className="text-gray-400 text-xs">{service}</Text>
      </View>

      {/* Status Badge */}
      <View className={`px-3 py-1.5 rounded-lg ${getStatusColor(status)}`}>
        <Text
          className={`text-xs font-semibold uppercase ${
            getStatusColor(status).split(' ')[1]
          }`}
        >
          {status}
        </Text>
      </View>
    </View>
  );
};

// Section Header Component
export const SectionHeader = ({ title }) => (
  <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 mt-4">
    {title}
  </Text>
);
