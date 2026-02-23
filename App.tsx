import './global.css';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { AccountType } from './src/screens/Modules/doctor/Auth/AccountType';
import { SignIn } from './src/screens/Modules/doctor/Auth/SignIn';
import { SignUp } from './src/screens/Modules/doctor/Auth/SignUp';
import { ForgotPassword } from './src/screens/Modules/doctor/Auth/ForgotPassword';
import { MainTabs } from './src/components/MainTabs';
import { PatientTabNavigator } from './src/screens/Modules/patient/Navigation/PatientTabNavigator';
import { RootStackParamList } from './src/types/navigation';
import { PatientUIProvider, usePatientUI } from './src/screens/Modules/patient/Components/PatientUIContext';
import { MedicalRecords } from './src/screens/Modules/patient/Screens/MedicalRecords';
import { ScheduleSettings } from './src/screens/Modules/doctor/Screens/ScheduleSettings';
import { Reschedule } from './src/screens/Modules/patient/Screens/Reschedule';
import { BookAppointment } from './src/screens/Modules/patient/Screens/BookAppointment';
import { Favorites } from './src/screens/Modules/patient/Screens/Favorites';
import { NearbyMedicalCenters } from './src/screens/Modules/patient/Screens/NearbyMedicalCenters';
import { MedicalCenterDetails } from './src/screens/Modules/patient/Screens/MedicalCenterDetails';
import { PatientDoctors } from './src/screens/Modules/patient/Screens/PatientDoctors';
import { DoctorReviews } from './src/screens/Modules/patient/Screens/DoctorReviews';
import { AddReview } from './src/screens/Modules/patient/Screens/AddReview';
import { EditProfile } from './src/screens/Modules/patient/Screens/EditProfile';
import { DoctorDetailsDrawer } from './src/screens/Modules/patient/Components/DoctorDetailsDrawer';
import { ReviewsDrawer } from './src/screens/Modules/patient/Components/ReviewsDrawer';
import { View, Modal, TouchableWithoutFeedback } from 'react-native';
import SplashScreen from './src/components/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerShown: false,
  animation: 'fade' as const,
  animationDuration: 200,
  gestureEnabled: false,
  cardStyle: { backgroundColor: '#ffffff' },
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="AccountType">
    <Stack.Screen name="AccountType" component={AccountType} />
    <Stack.Screen name="SignIn" component={SignIn} />
    <Stack.Screen name="SignUp" component={SignUp} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
  </Stack.Navigator>
);

const DoctorNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="ScheduleSettings" component={ScheduleSettings} />
  </Stack.Navigator>
);

const PatientNavigator = () => {
  const { isDoctorDrawerOpen, closeDoctorDrawer, isReviewsDrawerOpen, closeReviewsDrawer } = usePatientUI();
  
  return (
    <>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="PatientTabs" component={PatientTabNavigator} />
        <Stack.Screen name="Favorites" component={Favorites} />
        <Stack.Screen name="PatientDoctors" component={PatientDoctors} />
        <Stack.Screen
          name="NearbyMedicalCenters"
          component={NearbyMedicalCenters}
        />
        <Stack.Screen
          name="MedicalCenterDetails"
          component={MedicalCenterDetails}
        />
        <Stack.Screen name="MedicalRecords" component={MedicalRecords} />
        <Stack.Screen name="Reschedule" component={Reschedule} />
        <Stack.Screen name="BookAppointment" component={BookAppointment} />
        <Stack.Screen
          name="DoctorReviews"
          component={DoctorReviews}
          initialParams={{ doctorId: undefined, doctorName: undefined }}
        />
        <Stack.Screen
          name="AddReview"
          component={AddReview}
          initialParams={{ doctorId: undefined, doctorName: undefined, appointmentId: undefined }}
        />
        <Stack.Screen name="EditProfile" component={EditProfile} />
      </Stack.Navigator>

      {/* Doctor Details Drawer Modal */}
      <Modal
        visible={isDoctorDrawerOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeDoctorDrawer}
      >
        <TouchableWithoutFeedback onPress={closeDoctorDrawer}>
          <View className="flex-1 bg-black/30 justify-center">
            <TouchableWithoutFeedback>
              <View className="absolute right-0 top-0 bottom-0 bg-white w-full h-full">
                <DoctorDetailsDrawer />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Reviews Drawer Modal */}
      <Modal
        visible={isReviewsDrawerOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeReviewsDrawer}
      >
        <TouchableWithoutFeedback onPress={closeReviewsDrawer}>
          <View className="flex-1 bg-black/30 justify-center">
            <TouchableWithoutFeedback>
              <View className="absolute right-0 top-0 bottom-0 bg-white w-full h-full">
                <ReviewsDrawer />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const RootNavigation = () => {
  const { isAuthenticated, accountType } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        accountType === 'doctor' ? (
          <DoctorNavigator />
        ) : (
          <PatientNavigator />
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NotificationProvider>
          <BottomSheetModalProvider>
            <PatientUIProvider>
              <RootNavigation />
            </PatientUIProvider>
          </BottomSheetModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
