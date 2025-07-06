'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

type Profile = {
  id: number | null;
  name: string;
  gender: string;
  weight: number | string;
  goals: string;
  birthDate: Date | null;
  age?: number;
};

type UserDataContextType = {
  profile: Profile | null;
  creditBalance: number | null;
  isLoading: boolean;
  isSubscriptionError: boolean;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  fetchProfile: () => Promise<void>;
};

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

const initialProfileState: Profile = {
  id: null,
  name: '',
  gender: 'Prefer not to say',
  weight: '',
  goals: '',
  birthDate: null,
};

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscriptionError, setIsSubscriptionError] = useState(false);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsSubscriptionError(false);
    try {
      const [profileRes, creditRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/credit/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileRes.status === 401 || profileRes.status === 403) {
        setIsSubscriptionError(true);
        setIsLoading(false);
        return;
      }

      if (!profileRes.ok) {
        throw new Error('Could not load your profile information.');
      }
      
      const data = await profileRes.json();
      if (data && data.length > 0) {
        const userProfile = data[0];
        setProfile({
          ...userProfile,
          birthDate: userProfile.birthDate
            ? new Date(userProfile.birthDate)
            : null,
        });
      } else {
        setProfile(initialProfileState);
      }

      if (creditRes.ok) {
        const data = await creditRes.json();
        setCreditBalance(data.credits);
      } else {
        console.error('Failed to fetch credit balance');
      }
    } catch (error: any) {
      console.error('Failed to fetch user data', error);
      setProfile(initialProfileState);
      toast({
        variant: 'destructive',
        title: 'Could Not Load Data',
        description: error.message || 'There was a problem connecting to the server.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  const value = {
    profile,
    creditBalance,
    isLoading,
    setProfile,
    fetchProfile,
    isSubscriptionError,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
