import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api, handleApiCall, setAuthHeaders, clearAuthHeaders } from '../services/api';

export type AccountType = 'patient' | 'doctor';

interface User {
  id?: string;
  email: string;
  fullName?: string;
  accountType: AccountType;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  accountType: AccountType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAccountType: (type: AccountType) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accountType, setAccountTypeState] = useState<AccountType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setAccountType = (type: AccountType): void => {
    setAccountTypeState(type);
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (!accountType) {
        throw new Error('Please select an account type before signing in');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!password || password.length < 1) {
        throw new Error('Password is required');
      }

      const response = await api.login(email, password, accountType);

      console.log('Login response:', response);

      const userData = (response as any).data?.user || response.user;
      const tokensData = (response as any).data?.tokens || response.tokens;

      let userId = userData?.id;
      if (accountType === 'doctor' && email === 'sarah.johnson@healthcare.com') {
        userId = 'doctor_1';
      }

      const userIdToUse = userId || `user_${Date.now()}`;
      const newUser: User = {
        id: userIdToUse,
        email,
        fullName: userData?.fullName || userData?.full_name || 'User',
        accountType,
        profileImage: userData?.profileImage || userData?.profile_image,
      };
      setUser(newUser);

      const accessToken = tokensData?.accessToken;
      console.log('Login successful, user ID:', userIdToUse, 'token:', accessToken ? 'present' : 'MISSING');
      setAuthHeaders(userIdToUse, accountType, accessToken);
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };


  const signUp = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      if (!accountType) {
        throw new Error('Please select an account type before signing up');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!fullName || fullName.trim().length < 2) {
        throw new Error('Please enter your full name');
      }

      const response = await api.register({ email, password, fullName, accountType });

      const userData = (response as any).data?.user || response.user;
      const tokens = (response as any).data?.tokens || response.tokens;

      if (!userData || !tokens?.accessToken) {
        throw new Error('Invalid signup response from server');
      }

      const userId = userData.id || `user_${Date.now()}`;
      const newUser: User = {
        id: userId,
        email,
        fullName: userData?.fullName || userData?.full_name || fullName,
        accountType,
        profileImage: userData?.profileImage || userData?.profile_image,
      };

      setUser(newUser);
      console.log('Signup successful, token:', tokens.accessToken ? 'present' : 'MISSING');
      setAuthHeaders(userId, accountType, tokens.accessToken);
    } catch (error: any) {
      console.error('Sign up failed:', error);
      throw new Error(error.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = (): void => {
    setUser(null);
    setAccountTypeState(null);
    clearAuthHeaders();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accountType,
        isAuthenticated: !!user,
        isLoading,
        setAccountType,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
