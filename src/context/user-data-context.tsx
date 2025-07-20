
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Profile = {
  id: number | null;
  name: string;
  gender: string;
  weight: number;
  goals: string;
  birthDate: string | null;
  age?: number;
  isSubscribed?: boolean;
  email?: string;
};

type UserDataContextType = {
  profile: Profile | null;
  creditBalance: number | null;
  isLoading: boolean;
  saveProfile: (profile: Profile) => Promise<void>;
  fetchProfile: () => void;
  updateCreditBalance: (force?: boolean) => Promise<void>;
  isSubscriptionModalOpen: boolean;
  setSubscriptionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

const initialProfileState: Profile = {
  id: null,
  name: '',
  gender: 'Prefer not to say',
  weight: 0,
  goals: '',
  birthDate: null,
  isSubscribed: false,
};

const getCachedCredits = (): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const cached = localStorage.getItem('creditBalance');
  return cached ? JSON.parse(cached) : null;
};

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(
    getCachedCredits()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
        setIsLoading(false);
        setProfile(initialProfileState);
        return;
    }

    try {
        // Fetch subscription status from the backend
        const subResponse = await fetch(`${API_BASE_URL}/api/event/subscription/status`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store', // Always get the latest status
        });
        const subData = subResponse.ok ? await subResponse.json() : { isSubscribed: false };
        
        // Load local profile data from storage
        const storedProfile = localStorage.getItem('userProfile');
        let localProfile: Profile;
        if (storedProfile) {
            const parsed = JSON.parse(storedProfile);
            // Ensure birthDate is a string for consistency with the server
            const birthDateString = parsed.birthDate ? new Date(parsed.birthDate).toISOString() : null;
            localProfile = { ...parsed, birthDate: birthDateString };
        } else {
            localProfile = initialProfileState;
        }

        // Combine local profile with authoritative subscription status from the server
        setProfile({ ...localProfile, isSubscribed: subData.isSubscribed });

    } catch (error) {
      console.error('Failed to load profile/subscription status', error);
      // Fallback to initial state on error
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          const birthDateString = parsed.birthDate ? new Date(parsed.birthDate).toISOString() : null;
          setProfile({ ...parsed, birthDate: birthDateString, isSubscribed: false });
      } else {
          setProfile(initialProfileState);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = useCallback(
    async (profileData: Profile) => {
      try {
        const calculateAge = (birthDate: string | null): number | undefined => {
          if (!birthDate) return undefined;
          const today = new Date();
          let age = today.getFullYear() - new Date(birthDate).getFullYear();
          const m = today.getMonth() - new Date(birthDate).getMonth();
          if (m < 0 || (m === 0 && today.getDate() < new Date(birthDate).getDate())) {
            age--;
          }
          return age;
        };

        const profileToSave = {
          ...profileData,
          age: calculateAge(profileData.birthDate),
        };
        
        localStorage.setItem('userProfile', JSON.stringify(profileToSave));
        setProfile(profileToSave);

      } catch (error) {
        console.error('Failed to save profile to localStorage', error);
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: 'Could not save your profile data locally.',
        });
      }
    },
    [toast]
  );

  const updateCreditBalance = useCallback(async (force = false) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    if (!force) {
      const cached = getCachedCredits();
      if (cached !== null) {
        setCreditBalance(cached);
        return;
      }
    }

    try {
      const creditRes = await fetch(`${API_BASE_URL}/api/credit/balance`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store', // Always fetch latest credits
      });

      if (creditRes.ok) {
        const data = await creditRes.json();
        const newBalance = data.credits;
        setCreditBalance(newBalance);
        localStorage.setItem('creditBalance', JSON.stringify(newBalance));
      }
    } catch (error) {
      console.error('Failed to fetch credit balance', error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    updateCreditBalance();
  }, [fetchProfile, updateCreditBalance]);

  const value = {
    profile,
    creditBalance,
    isLoading,
    saveProfile,
    fetchProfile,
    updateCreditBalance,
    isSubscriptionModalOpen,
    setSubscriptionModalOpen,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
      <AlertDialog
        open={isSubscriptionModalOpen}
        onOpenChange={setSubscriptionModalOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need an active subscription to access this feature. Please
              subscribe to unlock all features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/pricing">Subscribe Now</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
