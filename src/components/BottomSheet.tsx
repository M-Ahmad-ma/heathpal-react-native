import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

export type SheetRef = {
  open: () => void;
  expand: () => void;
  close: () => void;
};

interface BottomSheetModalProps {
  open: boolean;
  onClose: () => void;
}

const BottomSheetModalComponent = ({
  open,
  onClose,
}: BottomSheetModalProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [treatmentType, setTreatmentType] = useState('General Cleaning');

  const snapPoints = useMemo(() => ['85%'], []);

  useEffect(() => {
    if (open) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [open]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1 && open) {
        onClose();
      }
    },
    [open, onClose],
  );

  const handleBookAppointment = () => {
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={open ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView className="flex-1 bg-white">
        <BottomSheetScrollView
          contentContainerClassName="px-6 py-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-2xl font-bold text-gray-900">
              New Appointment
            </Text>

            <TouchableOpacity onPress={handleClose} className="p-2">
              <Text className="text-2xl text-gray-600">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-400 mb-3">
              SELECT PATIENT
            </Text>

            <View className="bg-gray-100 rounded-xl px-4 py-1 flex-row items-center">
              <Text className="text-gray-600 mr-3">👤</Text>

              <TextInput
                className="flex-1 text-gray-700 text-base"
                placeholder="Select a patient..."
                placeholderTextColor="#999"
                value={selectedPatient}
                onChangeText={setSelectedPatient}
              />
            </View>
          </View>

          <View className="mb-6">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-400 mb-3">
                  DATE
                </Text>

                <View className="bg-gray-100 rounded-xl px-4 py-1 flex-row items-center">
                  <TextInput
                    className="flex-1 text-gray-700 text-base"
                    placeholder="mm/dd/yyyy"
                    placeholderTextColor="#999"
                    value={date}
                    onChangeText={setDate}
                  />

                  <Text className="text-gray-400 ml-2">📅</Text>
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-400 mb-3">
                  TIME
                </Text>

                <View className="bg-gray-100 rounded-xl px-4 py-1 flex-row items-center">
                  <TextInput
                    className="flex-1 text-gray-700 text-base"
                    placeholder="--:-- --"
                    placeholderTextColor="#999"
                    value={time}
                    onChangeText={setTime}
                  />

                  <Text className="text-gray-400 ml-2">🕐</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-400 mb-3">
              TREATMENT TYPE
            </Text>

            <View className="bg-gray-100 rounded-2xl px-4 py-3">
              <TextInput
                className="text-gray-400 text-base"
                value={treatmentType}
                onChangeText={setTreatmentType}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleBookAppointment}
            className="bg-[#009689] rounded-xl py-4 items-center mb-6"
          >
            <Text className="text-white text-lg font-semibold">
              Book Appointment
            </Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const Sheet = forwardRef<SheetRef, {}>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [selectedPatient, setSelectedPatient] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [treatmentType, setTreatmentType] = useState('General Cleaning');

  const snapPoints = useMemo(() => ['100%'], []);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.snapToIndex(0),
    expand: () => bottomSheetRef.current?.snapToIndex(1),
    close: () => bottomSheetRef.current?.close(),
  }));

  const handleSheetChanges = useCallback((index: number) => {
    // Sheet changed to index
  }, []);

  const handleBookAppointment = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView className="flex-1 bg-white">
        <BottomSheetScrollView
          contentContainerClassName="px-6 py-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-2xl font-bold text-gray-900">
              New Appointment
            </Text>

            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.close()}
              className="p-2"
            >
              <Text className="text-2xl text-gray-600">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-400 mb-3">
              SELECT PATIENT
            </Text>

            <View className="bg-gray-100 rounded-xl px-4 py-1 flex-row items-center">
              <Text className="text-gray-600 mr-3">👤</Text>

              <TextInput
                className="flex-1 text-gray-700 text-base"
                placeholder="Select a patient..."
                placeholderTextColor="#999"
                value={selectedPatient}
                onChangeText={setSelectedPatient}
              />
            </View>
          </View>

          <View className="mb-6">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-400 mb-3">
                  DATE
                </Text>

                <View className="bg-gray-100 rounded-xl px-4 py-1 flex-row items-center">
                  <TextInput
                    className="flex-1 text-gray-700 text-base"
                    placeholder="mm/dd/yyyy"
                    placeholderTextColor="#999"
                    value={date}
                    onChangeText={setDate}
                  />

                  <Text className="text-gray-400 ml-2">📅</Text>
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-400 mb-3">
                  TIME
                </Text>

                <View className="bg-gray-100 rounded-xl px-4 py-1 flex-row items-center">
                  <TextInput
                    className="flex-1 text-gray-700 text-base"
                    placeholder="--:-- --"
                    placeholderTextColor="#999"
                    value={time}
                    onChangeText={setTime}
                  />

                  <Text className="text-gray-400 ml-2">🕐</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-400 mb-3">
              TREATMENT TYPE
            </Text>

            <View className="bg-gray-100 rounded-2xl px-4 py-3">
              <TextInput
                className="text-gray-400 text-base"
                value={treatmentType}
                onChangeText={setTreatmentType}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleBookAppointment}
            className="bg-[#009689] rounded-xl py-4 items-center mb-6"
          >
            <Text className="text-white text-lg font-semibold">
              Book Appointment
            </Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});

Sheet.displayName = 'Sheet';

export default Sheet;
export { BottomSheetModalComponent };
