import React, { createContext, useContext, useState, ReactNode } from 'react';
import { doctors } from '../Screens/PatientDoctors';

interface Review {
  id: string;
  name: string;
  image: string;
  rating: number;
  comment: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  image: string;
  bio: string;
  education: string[];
  services: string[];
  availability: string[];
  available: boolean;
  reviews: string;
  bgColor?: string;
  reviewsArray: Review[];
}

interface PatientUIContextType {
  isDrawerOpen: boolean;
  isAppointmentModalOpen: boolean;
  isDoctorDrawerOpen: boolean;
  isNotificationDrawerOpen: boolean;
  isReviewsDrawerOpen: boolean;
  selectedDoctor: Doctor | null;
  doctorDrawerSource: 'appointments' | 'general' | null;
  reviewsDrawerDoctorId: string | null;
  reviewsDrawerDoctorName: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  openDoctorDrawer: (
    doctor: Doctor,
    source?: 'appointments' | 'general',
  ) => void;
  closeDoctorDrawer: () => void;
  notificationSource: 'appointments' | 'general' | null;
  openNotificationDrawer: () => void;
  closeNotificationDrawer: () => void;
  openAppointmentModal: () => void;
  closeAppointmentModal: () => void;
  openReviewsDrawer: (doctorId: string, doctorName: string) => void;
  closeReviewsDrawer: () => void;
}

const PatientUIContext = createContext<PatientUIContextType | undefined>(
  undefined,
);

export const usePatientUI = () => {
  const context = useContext(PatientUIContext);
  if (!context) {
    throw new Error('usePatientUI must be used within PatientUIProvider');
  }
  return context;
};

// const doctors: Doctor[] = [
//
//   {
//     id: '1',
//     name: 'Dr. Sarah Johnson',
//     specialty: 'General Dentist',
//     rating: 4.8,
//     experience: '10 years',
//     location: 'Downtown Clinic',
//     image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
//     bio: 'Experienced general dentist specializing in preventive care and routine checkups.',
//     education: [
//       ' DDS - Harvard School of Dental Medicine',
//       ' BDS - University of Karachi',
//     ],
//     services: ['Teeth Cleaning', 'Fillings', 'Root Canal', 'Crowns & Bridges'],
//     availability: ['Mon - Fri: 9AM - 5PM', 'Sat: 10AM - 2PM'],
//     available: true,
//   },
//   {
//     id: '2',
//     name: 'Dr. Michael Chen',
//     specialty: 'Orthodontist',
//     rating: 4.9,
//     experience: '15 years',
//     location: 'West Side Dental',
//     image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
//     bio: 'Leading orthodontist with expertise in braces and Invisalign treatments.',
//     education: ['MDS Orthodontics - NYU', ' BDS - University of London'],
//     services: ['Braces', 'Invisalign', 'Retainers', 'Jaw Surgery'],
//     availability: ['Mon - Wed: 10AM - 6PM', 'Thu - Fri: 9AM - 5PM'],
//     available: true,
//   },
//   {
//     id: '3',
//     name: 'Dr. Emily Brown',
//     specialty: 'Pediatric Dentist',
//     rating: 4.7,
//     experience: '8 years',
//     location: 'Family Dental Care',
//     image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
//     bio: 'Compassionate pediatric dentist dedicated to childrens dental health.',
//     education: [
//       'Pediatric Dentistry Fellowship - Boston University',
//       ' BDS - University of Toronto',
//     ],
//     services: [
//       'Child Checkups',
//       'Sealants',
//       'Fluoride Treatment',
//       'Sedation Dentistry',
//     ],
//     availability: ['Mon - Fri: 8AM - 4PM'],
//     available: false,
//   },
//   {
//     id: '4',
//     name: 'Dr. James Wilson',
//     specialty: 'Oral Surgeon',
//     rating: 4.9,
//     experience: '12 years',
//     location: 'Downtown Clinic',
//     image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
//     bio: 'Skilled oral surgeon specializing in complex extractions and implants.',
//     education: ['Oral Surgery Residency - UCSF', ' DDS - Stanford University'],
//     services: [
//       'Tooth Extraction',
//       'Dental Implants',
//       'Bone Grafting',
//       'Wisdom Teeth',
//     ],
//     availability: ['Mon - Thu: 9AM - 5PM', 'Fri: 9AM - 3PM'],
//     available: true,
//   },
//   {
//     id: '5',
//     name: 'Dr. Lisa Anderson',
//     specialty: 'Cosmetic Dentist',
//     rating: 4.8,
//     experience: '9 years',
//     location: 'Aesthetic Dental Studio',
//     image: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200',
//     bio: 'Expert cosmetic dentist transforming smiles with advanced aesthetic treatments.',
//     education: [
//       'Cosmetic Dentistry Certificate - USC',
//       ' BDS - University of Sydney',
//     ],
//     services: ['Veneers', 'Teeth Whitening', 'Bonding', 'Smile Makeover'],
//     availability: ['Tue - Sat: 10AM - 6PM'],
//     available: true,
//   },
// ];

export const getDoctorsBySpecialty = () => {
  const specialtyMap: Record<string, Doctor[]> = {};
  doctors.forEach(doctor => {
    if (!specialtyMap[doctor.specialty]) {
      specialtyMap[doctor.specialty] = [];
    }
    specialtyMap[doctor.specialty].push(doctor);
  });
  return specialtyMap;
};

export const getAllSpecialties = () => {
  return [...new Set(doctors.map(d => d.specialty))];
};

export const getAllDoctors = () => doctors;

interface PatientUIProviderProps {
  children: ReactNode;
}

export const PatientUIProvider = ({ children }: PatientUIProviderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorDrawerSource, setDoctorDrawerSource] = useState<
    'appointments' | 'general' | null
  >(null);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const openAppointmentModal = () => setIsAppointmentModalOpen(true);
  const closeAppointmentModal = () => setIsAppointmentModalOpen(false);

  const [isDoctorDrawerOpen, setIsDoctorDrawerOpen] = useState(false);
  const openDoctorDrawer = (
    doctor: Doctor,
    source: 'appointments' | 'general' = 'general',
  ) => {
    setSelectedDoctor(doctor);
    setDoctorDrawerSource(source);
    setIsDoctorDrawerOpen(true);
  };
  const closeDoctorDrawer = () => {
    setIsDoctorDrawerOpen(false);
    setDoctorDrawerSource(null);
  };

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] =
    useState(false);
  const [notificationSource, setNotificationSource] = useState<
    'appointments' | 'general' | null
  >(null);
  const openNotificationDrawer = (
    source: 'appointments' | 'general' = 'general',
  ) => {
    setNotificationSource(source);
    setIsNotificationDrawerOpen(true);
  };
  const closeNotificationDrawer = () => {
    setIsNotificationDrawerOpen(false);
    setNotificationSource(null);
  };

  const [isReviewsDrawerOpen, setIsReviewsDrawerOpen] = useState(false);
  const [reviewsDrawerDoctorId, setReviewsDrawerDoctorId] = useState<string | null>(null);
  const [reviewsDrawerDoctorName, setReviewsDrawerDoctorName] = useState<string | null>(null);
  const openReviewsDrawer = (doctorId: string, doctorName: string) => {
    setReviewsDrawerDoctorId(doctorId);
    setReviewsDrawerDoctorName(doctorName);
    setIsReviewsDrawerOpen(true);
  };
  const closeReviewsDrawer = () => {
    setIsReviewsDrawerOpen(false);
    setReviewsDrawerDoctorId(null);
    setReviewsDrawerDoctorName(null);
  };

  return (
    <PatientUIContext.Provider
      value={{
        isDrawerOpen,
        isAppointmentModalOpen,
        isDoctorDrawerOpen,
        isNotificationDrawerOpen,
        isReviewsDrawerOpen,
        selectedDoctor,
        doctorDrawerSource,
        notificationSource,
        reviewsDrawerDoctorId,
        reviewsDrawerDoctorName,
        openDrawer,
        closeDrawer,
        openDoctorDrawer,
        closeDoctorDrawer,
        openNotificationDrawer,
        closeNotificationDrawer,
        openAppointmentModal,
        closeAppointmentModal,
        openReviewsDrawer,
        closeReviewsDrawer,
      }}
    >
      {children}
    </PatientUIContext.Provider>
  );
};
