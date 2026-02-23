import React, { createContext, useContext, useState } from 'react';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { PatientDetails } from '../components/PatientDetails';
import { Patients } from '../screens/Modules/doctor/Patients';

export interface Patient {
  id: string;
  initials: string;
  name: string;
  lastVisit: string;
  nextVisit: string;
  patientId: string;
  profileImage?: string;
  hasAlert: boolean;
  doctorName?: string;
  treatmentHistory: Array<{
    title: string;
    description: string;
    date: string;
    status?: string;
  }>;
  treatmentCount?: number;
  email?: string;
  phone?: string;
  dateOfBirth?: string | null;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  allergies?: string[];
  bloodType?: string;
}

interface PatientContextType {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatientContext must be used within PatientDrawer');
  }
  return context;
};

const Drawer = createDrawerNavigator();

const PatientDrawerContent = ({
  drawerProps,
}: {
  drawerProps?: DrawerContentComponentProps;
}) => {
  return <PatientDetails drawerProps={drawerProps} />;
};

export const PatientDrawer = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <PatientContext.Provider value={{ selectedPatient, setSelectedPatient }}>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerPosition: 'right',
          drawerType: 'front',
          overlayColor: 'rgba(0,0,0,0.4)',
          drawerStyle: {
            width: '100%',
            backgroundColor: '#fff',
          },
        }}
        drawerContent={(props: DrawerContentComponentProps) => (
          <PatientDrawerContent drawerProps={props} />
        )}
      >
        <Drawer.Screen
          name="PatientsHome"
          component={Patients}
          options={{ drawerLabel: 'Patients' }}
        />
      </Drawer.Navigator>
    </PatientContext.Provider>
  );
};
