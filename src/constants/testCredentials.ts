export const TEST_CREDENTIALS = {
  dentist: {
    email: 'sarah.johnson@dentalcare.com',
    password: 'password',
    accountType: 'doctor',
    fullName: 'Dr. Sarah Johnson',
    specialty: 'Dentist',
  },
  patient: {
    email: 'sarah.wilson@email.com',
    password: 'password',
    accountType: 'patient',
    fullName: 'Sarah Wilson',
  },
};

export const getTestCredentials = (type: 'doctor' | 'patient') => {
  if (type === 'doctor') {
    return [TEST_CREDENTIALS.dentist];
  }
  return [TEST_CREDENTIALS.patient];
};

export const DEFAULT_CREDENTIALS = {
  doctor: TEST_CREDENTIALS.dentist,
  patient: TEST_CREDENTIALS.patient,
};
