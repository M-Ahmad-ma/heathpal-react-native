import { Text, View, TouchableOpacity, Image } from 'react-native';
import { AlertCircle, ChevronRight } from 'lucide-react-native';

interface HubCardProps {
  time: string;
  name: string;
  service: string;
  status: string;
  onPress?: undefined;
  initials?: undefined;
  lastVisit?: undefined;
  bgColor?: undefined;
  hasAlert?: undefined;
}

interface PatientListCardProps {
  initials: string;
  name: string;
  lastVisit: string;
  bgColor: string;
  hasAlert: boolean;
  onPress: () => void;
  time?: undefined;
  service?: undefined;
  status?: undefined;
}

type PatientCardProps = HubCardProps | PatientListCardProps;

export const PatientCard = (props: PatientCardProps) => {
  const isHubCard = props.time !== undefined;

  if (isHubCard) {
    const { time, name, service, status } = props as HubCardProps;
    return (
      <View
        className="bg-white border-2 border-[#e2e8f0] p-4 mb-3 flex-row justify-between items-center rounded-xl "
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 4, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 9,
          elevation: 1,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="bg-[#f1f5f9] text-center py-4 px-2 w-fit rounded-xl">
            <Text className="w-full font-medium text-[#455570]">{time}</Text>
          </View>
          <View>
            <Text>{name}</Text>
            <Text className="w-full text-xs font-normal">{service}</Text>
          </View>
        </View>
        <View>
          <Text className="w-full font-normal text-xs ml-5">{status}</Text>
        </View>
      </View>
    );
  }

  const { initials, name, lastVisit, bgColor, hasAlert, onPress } =
    props as PatientListCardProps;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white border border-gray-200 p-4 mb-3 rounded-xl flex-row items-center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        className={`w-12 h-12 rounded-full items-center justify-center ${bgColor}`}
      >
        <Text className="font-semibold text-gray-700">{initials}</Text>
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <Text className="font-semibold text-gray-900">{name}</Text>
          {hasAlert && (
            <AlertCircle size={14} color="#ef4444" style={{ marginLeft: 6 }} />
          )}
        </View>
        <Text className="text-sm text-gray-500 mt-1">
          Last visit: {lastVisit}
        </Text>
      </View>


      <View className="ml-2 flex-row items-center">
        <View
          className="w-7 h-7  bg-gray-400 rounded-full items-center justify-center"
        >
          <Text className="text-xs text-gray-100">IMG</Text>
        </View>
        <ChevronRight color='gray' />
      </View>

    </TouchableOpacity>
  );
};
