import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Patient } from './PatientDrawer';

interface ModalContextType {
  isBottomSheetOpen: boolean;
  openBottomSheet: () => void;
  closeBottomSheet: () => void;
  selectedPatientForBooking: Patient | null;
  setSelectedPatientForBooking: (patient: Patient | null) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedPatientForBooking, setSelectedPatientForBooking] =
    useState<Patient | null>(null);

  const openBottomSheet = useCallback(() => {
    setIsBottomSheetOpen(true);
  }, []);

  const closeBottomSheet = useCallback(() => {
    setIsBottomSheetOpen(false);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        isBottomSheetOpen,
        openBottomSheet,
        closeBottomSheet,
        selectedPatientForBooking,
        setSelectedPatientForBooking,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
