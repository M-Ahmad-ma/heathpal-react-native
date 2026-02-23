import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Use environment variable or fallback to Railway URL for production
const getApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl;
  }
  // Default to Railway production URL
  return 'https://health-api-node-js-production.up.railway.app/api/v1';
};

const API_BASE_URL = getApiUrl();

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Simple storage for auth headers
let authHeaders: { userId?: string; userType?: string; token?: string } = {};

export const setAuthHeaders = (
  userId: string,
  userType: string,
  token?: string,
) => {
  authHeaders = { userId, userType, token };
};

export const clearAuthHeaders = () => {
  authHeaders = {};
};

export const getAuthHeaders = () => {
  return { ...authHeaders };
};

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(authHeaders.token && {
        Authorization: `Bearer ${authHeaders.token}`,
      }),
      ...(authHeaders.userId && { 'X-User-Id': authHeaders.userId }),
      ...(authHeaders.userType && { 'X-User-Type': authHeaders.userType }),
      ...(options.headers as Record<string, string>),
    };

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error?.message ||
            `HTTP error! status: ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async login(
    email: string,
    password: string,
    accountType: 'patient' | 'doctor',
  ) {
    return this.request<{
      success: boolean;
      data: {
        user: any;
        tokens: { accessToken: string; refreshToken: string };
      };
      message: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, accountType }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    accountType: 'patient' | 'doctor';
    phone?: string;
  }) {
    return this.request<{
      success: boolean;
      data: {
        user: any;
        tokens: { accessToken: string; refreshToken: string };
      };
      message: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async requestPasswordReset(email: string) {
    return this.request<{ success: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getPatientAppointments(patientId: string) {
    return this.request<any[]>(`/patients/${patientId}/appointments`);
  }

  async getDoctorAppointments(doctorId: string) {
    return this.request<any[]>(`/doctors/${doctorId}/appointments`);
  }

  async bookAppointment(bookingData: {
    doctorId: string;
    service: string;
    date: string;
    time: string;
    type: 'in-person' | 'video';
    notes?: string;
    medicalCenterId?: string;
  }) {
    return this.request<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string,
  ) {
    return this.request<any>(`/appointments/${appointmentId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ date: newDate, time: newTime }),
    });
  }

  async cancelAppointment(appointmentId: string) {
    return this.request<any>(`/appointments/${appointmentId}/cancel`, {
      method: 'POST',
    });
  }

  async getDoctors(filters?: {
    specialty?: string;
    rating?: string;
    available?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.rating) params.append('rating', filters.rating);
    if (filters?.available) params.append('available', filters.available);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/doctors${queryString ? `?${queryString}` : ''}`;

    return this.request<ApiResponse<any[]>>(endpoint);
  }

  async getDoctorDetails(doctorId: string) {
    return this.request<ApiResponse<any>>(`/doctors/${doctorId}`);
  }

  async getDoctorSchedule(doctorId: string) {
    return this.request<ApiResponse<any>>(`/doctors/${doctorId}/schedule`);
  }

  async getSpecialties() {
    return this.request<ApiResponse<any[]>>('/doctors/specialties');
  }

  async getMedicalCenters(filters?: {
    type?: string;
    rating?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.rating) params.append('rating', filters.rating);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/doctors/medical-centers${
      queryString ? `?${queryString}` : ''
    }`;

    return this.request<ApiResponse<any[]>>(endpoint);
  }

  async getAppointments(filters?: {
    status?: string;
    page?: number;
    limit?: number;
    includePatientDetails?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.includePatientDetails)
      params.append('includePatientDetails', 'true');

    const queryString = params.toString();
    const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;

    return this.request<ApiResponse<any[]>>(endpoint);
  }

  async getAppointmentById(appointmentId: string) {
    return this.request<ApiResponse<any>>(`/appointments/${appointmentId}`);
  }

  async getAvailableSlots(doctorId: string, date: string) {
    return this.request<ApiResponse<any[]>>(
      `/appointments/slots/available?doctorId=${doctorId}&date=${date}`,
    );
  }

  async getNotifications(filters?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.unreadOnly) params.append('unreadOnly', 'true');

    const queryString = params.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;

    return this.request<ApiResponse<any[]>>(endpoint);
  }

  async getUnreadNotificationCount() {
    return this.request<ApiResponse<{ count: number }>>(
      '/notifications/unread-count',
    );
  }

  async getBanners() {
    return this.request<ApiResponse<any[]>>('/banners');
  }

  async getCategories() {
    return this.request<ApiResponse<any[]>>('/categories');
  }

  async getNearbyMedicalCenters() {
    const params = new URLSearchParams();

    const queryString = params.toString();
    const endpoint = `/medical-centers/nearby${
      queryString ? `?${queryString}` : ''
    }`;

    return this.request<ApiResponse<any[]>>(endpoint);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<ApiResponse<any>>(
      `/notifications/${notificationId}/read`,
      {
        method: 'POST',
      },
    );
  }

  async markAllNotificationsAsRead() {
    return this.request<ApiResponse<any>>('/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  async getFavorites(filters?: { type?: 'doctor' | 'medical_center' }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);

    const queryString = params.toString();
    const endpoint = `/favorites${queryString ? `?${queryString}` : ''}`;

    return this.request<ApiResponse<any[]>>(endpoint);
  }

  async addDoctorToFavorites(doctorId: string) {
    return this.request<ApiResponse<any>>(`/favorites/doctors/${doctorId}`, {
      method: 'POST',
    });
  }

  async removeDoctorFromFavorites(doctorId: string) {
    return this.request<ApiResponse<any>>(`/favorites/doctors/${doctorId}`, {
      method: 'DELETE',
    });
  }

  async checkDoctorIsFavorite(doctorId: string) {
    return this.request<ApiResponse<{ isFavorite: boolean }>>(
      `/favorites/doctors/${doctorId}/check`,
    );
  }

  async addMedicalCenterToFavorites(centerId: string) {
    return this.request<ApiResponse<any>>(
      `/favorites/medical-centers/${centerId}`,
      {
        method: 'POST',
      },
    );
  }

  async removeMedicalCenterFromFavorites(centerId: string) {
    return this.request<ApiResponse<any>>(
      `/favorites/medical-centers/${centerId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async checkMedicalCenterIsFavorite(centerId: string) {
    return this.request<ApiResponse<{ isFavorite: boolean }>>(
      `/favorites/medical-centers/${centerId}/check`,
    );
  }

  async getMedicalCenterById(centerId: string) {
    return this.request<ApiResponse<any>>(
      `/doctors/medical-centers/${centerId}`,
    );
  }

  async updateDoctorSchedule(
    doctorId: string,
    scheduleData: {
      enabled: boolean;
      schedules: Record<string, any[]>;
    },
  ) {
    return this.request<any>(`/doctors/${doctorId}/schedule`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  }

  async getPatientMedicalHistory(patientId: string) {
    return this.request<any>(`/patients/${patientId}/medical-history`);
  }

  async getPatientProfile(patientId: string) {
    return this.request<any>(`/patients/${patientId}`);
  }

  async updatePatientProfile(patientId: string, profileData: any) {
    return this.request<any>(`/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getDoctorProfile(doctorId: string) {
    return this.request<any>(`/doctors/${doctorId}`);
  }

  async updateDoctorProfile(doctorId: string, profileData: any) {
    return this.request<any>(`/doctors/${doctorId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getDoctorPatients(doctorId: string) {
    return this.request<any[]>(`/doctors/${doctorId}/patients`);
  }

  async getMyProfile() {
    return this.request<ApiResponse<any>>('/patients/me');
  }

  async updateMyProfile(profileData: any) {
    return this.request<ApiResponse<any>>('/patients/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getMyMedicalHistory() {
    return this.request<ApiResponse<any>>('/patients/me/medical-history');
  }

  async getDoctorReviews(doctorId: string, page = 1, limit = 10) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = `/doctors/${doctorId}/reviews${queryString ? `?${queryString}` : ''}`;

    return this.request<ApiResponse<any>>(endpoint);
  }
}

export const api = new ApiService();

export const showApiError = (error: any) => {
  const message = error instanceof Error ? error.message : 'An error occurred';
  Alert.alert('Error', message);
};

export const handleApiCall = async <T>(
  apiFunction: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: any) => void,
): Promise<T | null> => {
  try {
    const data = await apiFunction();
    if (onSuccess) onSuccess(data);
    return data;
  } catch (error) {
    showApiError(error);
    if (onError) onError(error);
    return null;
  }
};
