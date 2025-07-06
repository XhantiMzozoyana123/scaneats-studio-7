
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
  fetchProfile: () => Promise<void>;
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

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const profileRes = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.status === 401 || profileRes.status === 403) {
        setProfile(initialProfileState);
      } else if (profileRes.ok) {
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
        throw new Error('Could not load your profile information.');
      }
    } catch (error: any) {
      console.error('Failed to fetch user data', error);
      if (!(error.message.includes('401') || error.message.includes('403'))) {
        toast({
          variant: 'destructive',
          title: 'Could Not Load Data',
          description:
            error.message || 'There was a problem connecting to the server.',
        });
      }
      setProfile(initialProfileState);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
    updateCreditBalance(true);
  }, [fetchProfile, updateCreditBalance]);

  const value = {
    profile,
    creditBalance,
    isLoading,
    setProfile,
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
