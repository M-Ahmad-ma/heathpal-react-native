// Root Stack
export type RootStackParamList = {
  AccountType: undefined;
  SignIn: { accountType?: 'patient' | 'doctor'; prefillEmail?: string; prefillPassword?: string };
  SignUp: { accountType?: 'patient' | 'doctor' };
  ForgotPassword: undefined;
  MainTabs: undefined;
  Auth: undefined;
  DoctorApp: undefined;
  PatientApp: undefined;
  PatientTabs: undefined;
  MedicalRecords: undefined;
  ScheduleSettings: undefined;
  Reschedule: undefined;
  BookAppointment: undefined;
  Favorites: undefined;
  NearbyMedicalCenters: undefined;
  PatientDoctors: undefined;
  MedicalCenterDetails: { hospitalId: string };
  DoctorReviews: { doctorId?: string; doctorName?: string };
  AddReview: { doctorId?: string; doctorName?: string; appointmentId?: string };
  EditProfile: undefined;
};

// Tabs
export type TabParamList = {
  Hub: undefined;
  Bookings: undefined;
  Profile: undefined;
  Patients: undefined;
  BookingDrawer: undefined;
  PatientDrawer: undefined;
};

// Global typing (optional but recommended)
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
