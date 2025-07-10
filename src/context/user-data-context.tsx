
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
  id: 1, // Use a default ID for local management
  name: '',
  gender: 'Prefer not to say',
  weight: '',
  goals: '',
  birthDate: null,
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

  const fetchProfile = useCallback(() => {
    setIsLoading(true);
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile({
          ...parsedProfile,
          birthDate: parsedProfile.birthDate
            ? new Date(parsedProfile.birthDate)
            : null,
        });
      } else {
        setProfile(initialProfileState);
      }
    } catch (error) {
      console.error('Failed to load profile from localStorage', error);
      setProfile(initialProfileState);
      toast({
        variant: 'destructive',
        title: 'Could Not Load Profile',
        description: 'There was an issue reading your local profile data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveProfile = useCallback(
    async (profileData: Profile) => {
      setIsLoading(true);
      try {
        const calculateAge = (birthDate: Date | null): number | undefined => {
          if (!birthDate) return undefined;
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        };

        const profileToSave = {
          ...profileData,
          age: calculateAge(profileData.birthDate),
        };

        localStorage.setItem('userProfile', JSON.stringify(profileToSave));
        setProfile(profileToSave); // Update state
        toast({
          title: 'Success',
          description: 'Your profile has been saved successfully.',
        });
      } catch (error) {
        console.error('Failed to save profile to localStorage', error);
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: 'Could not save your profile data locally.',
        });
      } finally {
        setIsLoading(false);
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
      }
    }

    try {
      const creditRes = await fetch(`${API_BASE_URL}/api/credit/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (creditRes.ok) {
        const data = await creditRes.json();
        setCreditBalance(data.credits);
        localStorage.setItem('creditBalance', JSON.stringify(data.credits));
      } else {
        console.error(
          'Failed to fetch credit balance, using cached value if available.'
        );
      }
    } catch (error) {
      console.error('Failed to fetch credit balance', error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    updateCreditBalance(true);
  }, [fetchProfile, updateCreditBalance]);

  const value = {
    profile,
    creditBalance,
    isLoading,
    setProfile,
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
