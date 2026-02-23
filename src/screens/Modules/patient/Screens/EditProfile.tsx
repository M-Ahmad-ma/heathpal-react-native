import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Camera, Save, User, Phone, MapPin, Calendar, Shield, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { api, handleApiCall, showApiError } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  bloodType: string;
  primaryDoctorId: string;
  insuranceProvider: string;
  insuranceId: string;
}

interface FormData {
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact: string;
  allergies: string;
  bloodType: string;
  insuranceProvider: string;
  insuranceId: string;
}

const genderOptions = ['male', 'female', 'other', 'prefer_not_to_say'];
const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'];

export const EditProfile = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    allergies: '',
    bloodType: '',
    insuranceProvider: '',
    insuranceId: '',
  });
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      await handleApiCall(
        () => api.getMyProfile(),
        (data: any) => {
          if (data && data.data) {
            const profile = data.data;
            setProfileData(profile);
            setFormData({
              phone: profile.phone || '',
              address: profile.address || '',
              dateOfBirth: profile.dateOfBirth || '',
              gender: profile.gender || '',
              emergencyContact: profile.emergencyContact || '',
              allergies: Array.isArray(profile.allergies) ? profile.allergies.join(', ') : (profile.allergies || ''),
              bloodType: profile.bloodType || '',
              insuranceProvider: profile.insuranceProvider || '',
              insuranceId: profile.insuranceId || '',
            });
          }
        },
        (error) => {
          console.log('Error fetching profile:', error);
          showApiError(error);
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const updateData: any = {};

      if (formData.phone !== (profileData?.phone || '')) {
        updateData.phone = formData.phone;
      }
      if (formData.address !== (profileData?.address || '')) {
        updateData.address = formData.address;
      }
      if (formData.dateOfBirth !== (profileData?.dateOfBirth || '')) {
        updateData.dateOfBirth = formData.dateOfBirth;
      }
      if (formData.gender !== (profileData?.gender || '')) {
        updateData.gender = formData.gender;
      }
      if (formData.emergencyContact !== (profileData?.emergencyContact || '')) {
        updateData.emergencyContact = formData.emergencyContact;
      }
      if (formData.bloodType !== (profileData?.bloodType || '')) {
        updateData.bloodType = formData.bloodType;
      }
      if (formData.insuranceProvider !== (profileData?.insuranceProvider || '')) {
        updateData.insuranceProvider = formData.insuranceProvider;
      }
      if (formData.insuranceId !== (profileData?.insuranceId || '')) {
        updateData.insuranceId = formData.insuranceId;
      }

      const allergiesArray = formData.allergies
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
      const currentAllergies = Array.isArray(profileData?.allergies) ? profileData.allergies : [];
      if (JSON.stringify(allergiesArray) !== JSON.stringify(currentAllergies)) {
        updateData.allergies = allergiesArray;
      }

      if (Object.keys(updateData).length === 0) {
        Alert.alert('No Changes', 'No changes were made to your profile.');
        setSaving(false);
        return;
      }

      await handleApiCall(
        () => api.updateMyProfile(updateData),
        (data: any) => {
          Alert.alert('Success', 'Your profile has been updated successfully.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        (error) => {
          console.log('Error updating profile:', error);
          showApiError(error);
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1F2937" />
          <Text className="text-gray-500 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`p-2 -mr-2 ${saving ? 'opacity-50' : ''}`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#1F2937" />
            ) : (
              <Save size={24} color="#1F2937" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Profile Image */}
          <View className="items-center py-6">
            <View className="relative">
              <View className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-sm">
                <Image
                  source={{ uri: profileData?.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <TouchableOpacity className="absolute bottom-0 right-0 w-10 h-10 bg-gray-900 rounded-full items-center justify-center border-4 border-white shadow-sm">
                <Camera size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text className="text-lg font-semibold text-gray-900 mt-3">
              {profileData?.fullName || 'User Name'}
            </Text>
            <Text className="text-sm text-gray-500">{profileData?.email}</Text>
          </View>

          {/* Personal Information Section */}
          <View className="px-5 py-4">
            <View className="flex-row items-center mb-3">
              <User size={18} color="#6B7280" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Personal Information
              </Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 space-y-4">
              {/* Phone */}
              <View>
                <Text className="text-xs font-medium text-gray-500 mb-1 ml-1">Phone</Text>
                <View className="flex-row items-center bg-white rounded-lg px-3 py-3 border border-gray-200">
                  <Phone size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-gray-900"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    placeholder="Enter phone number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Date of Birth */}
              <View>
                <Text className="text-xs font-medium text-gray-500 mb-1 ml-1">Date of Birth</Text>
                <View className="flex-row items-center bg-white rounded-lg px-3 py-3 border border-gray-200">
                  <Calendar size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-gray-900"
                    value={formatDate(formData.dateOfBirth)}
                    onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Gender */}
              <View>
                <Text className="text-xs font-medium text-gray-500 mb-1 ml-1">Gender</Text>
                <View className="flex-row flex-wrap gap-2 mt-1">
                  {genderOptions.map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      onPress={() => setFormData({ ...formData, gender })}
                      className={`px-4 py-2 rounded-full border ${
                        formData.gender === gender
                          ? 'bg-gray-900 border-gray-900'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium capitalize ${
                          formData.gender === gender ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {gender.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Address */}
              <View>
                <Text className="text-xs font-medium text-gray-500 mb-1 ml-1">Address</Text>
                <View className="flex-row items-start bg-white rounded-lg px-3 py-3 border border-gray-200">
                  <MapPin size={18} color="#9CA3AF" style={{ marginTop: 2 }} />
                  <TextInput
                    className="flex-1 ml-2 text-gray-900"
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    placeholder="Enter your address"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Medical Information Section */}
          <View className="px-5 py-4">
            <View className="flex-row items-center mb-3">
              <Shield size={18} color="#6B7280" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Medical Information
              </Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 space-y-4">
              {/* Emergency Contact */}
              <View>
                <Text className="text-xs font-medium text-gray-500 mb-1 ml-1">Emergency Contact</Text>
                <View className="flex-row items-center bg-white rounded-lg px-3 py-3 border border-gray-200">
                  <Phone size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-gray-900"
                    value={formData.emergencyContact}
                    onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
                    placeholder="Emergency contact number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Blood Type */}
              <View>
                <Text className="text-xs font-medium text-gray-500 mb-1 ml-1">Blood Type</Text>
                <View className="flex-row flex-wrap gap-2 mt-1">
                  {bloodTypeOptions.map((bloodType) => (
                    <TouchableOpacity
                      key={bloodType}
                      onPress={() => setFormData({ ...formData, bloodType })}
                      className={`px-4 py-2 rounded-full border ${
                        formData.bloodType === bloodType
                          ? 'bg-gray-900 border-gray-900'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          formData.bloodType === bloodType ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {bloodType.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Allergies */}
              <View>
                <Text className="text-xs font-medium text-gray-500 mb-1 ml-1">
                  Allergies (comma separated)
                </Text>
                <View className="flex-row items-start bg-white rounded-lg px-3 py-3 border border-gray-200">
                  <Shield size={18} color="#9CA3AF" style={{ marginTop: 2 }} />
                  <TextInput
                    className="flex-1 ml-2 text-gray-900"
                    value={formData.allergies}
                    onChangeText={(text) => setFormData({ ...formData, allergies: text })}
                    placeholder="Penicillin, Sulfa, etc."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Insurance Information Section */}
          <View className="px-5 py-4 pb-8">
            <View className="flex-row items-center mb-3">
              <FileText size={18} color="#6B7280" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Insurance Information
              </Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 space-y-4">
              {/* Insurance Provider */}
              <View>
                <Text className="text-xs font-medium text-gray-500 mb-1 ml-1">Insurance Provider</Text>
                <View className="flex-row items-center bg-white rounded-lg px-3 py-3 border border-gray-200">
                  <FileText size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-gray-900"
                    value={formData.insuranceProvider}
                    onChangeText={(text) => setFormData({ ...formData, insuranceProvider: text })}
                    placeholder="e.g., Blue Cross, Aetna"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Insurance ID */}
              <View>
                <Text className="text-xs font-medium text-gray-500 mb-1 ml-1">Insurance ID</Text>
                <View className="flex-row items-center bg-white rounded-lg px-3 py-3 border border-gray-200">
                  <FileText size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-gray-900"
                    value={formData.insuranceId}
                    onChangeText={(text) => setFormData({ ...formData, insuranceId: text })}
                    placeholder="Insurance policy number"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View className="px-5 py-4 border-t border-gray-100 bg-white">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`bg-gray-900 rounded-xl py-4 items-center ${saving ? 'opacity-50' : ''}`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-base">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;
