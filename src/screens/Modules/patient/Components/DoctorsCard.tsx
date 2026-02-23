import { View, Text, Image } from 'react-native';
import { Doctor } from './PatientUIContext';
import { Star } from 'lucide-react-native';

export const renderDoctorCard = (item: Doctor) => (
  <View
    key={item.id}
    className="bg-white rounded-xl p-3.5 mb-3 border border-gray-100 flex-row items-center"
  >
    <View className="w-14 h-14 rounded-xl items-center justify-center mr-3 bg-gray-200">
      <Image
        source={{ uri: item.image }}
        className="w-14 h-14 rounded-xl"
        resizeMode="cover"
      />
    </View>

    <View className="flex-1 justify-center">
      <Text className="text-base font-bold text-gray-900 mb-1">
        {item.name}
      </Text>
      <Text className="text-xs text-gray-500 mb-2">{item.specialty}</Text>

      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center gap-1">
          <Star size={12} color="#FFA500" fill="#FFA500" />
          <Text className="text-xs font-semibold text-gray-700">
            {item.rating}
          </Text>
        </View>

        <View className="w-1 h-1 rounded-full bg-gray-300" />

        <Text className="text-xs text-gray-500">{item.experience}</Text>
      </View>
    </View>

    {item.available && (
      <View
        className="px-3 py-1.5 rounded-full"
        style={{ backgroundColor: '#E8F5F3' }}
      >
        <Text className="text-xs font-semibold" style={{ color: '#009689' }}>
          Available Today
        </Text>
      </View>
    )}

    <View className="ml-2">
      <Text className="text-gray-400 text-lg">›</Text>
    </View>
  </View>
);
