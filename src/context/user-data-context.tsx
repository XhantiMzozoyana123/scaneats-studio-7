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

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Let the main dashboard layout handle redirect.
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [profileRes, creditRes] = await Promise.all([
        fetch(`https://gjy9aw4wpj.loclx.io/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://gjy9aw4wpj.loclx.io/api/credit/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileRes.ok) {
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
      } else {
        setProfile(initialProfileState);
        console.error('Failed to fetch profile.');
        // Don't toast here on initial load, it can be annoying.
        // The page itself can guide the user.
      }

      if (creditRes.ok) {
        const data = await creditRes.json();
        setCreditBalance(data.credits);
      } else {
        console.error('Failed to fetch credit balance');
      }
    } catch (error) {
      console.error('Failed to fetch user data', error);
      setProfile(initialProfileState);
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: 'Could not load your user information.',
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
