
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
import { useRouter } from 'next/navigation';

export type Profile = {
  id: number | null;
  name: string;
  gender: string;
  weight: number | string;
  goals: string;
  birthDate: Date | null;
  age?: number;
  isSubscribed?: boolean;
};

type ScannedFood = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
};


type UserDataContextType = {
  profile: Profile | null;
  initialProfile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  scannedFood: ScannedFood | null | undefined; // undefined for loading, null for no food
  setScannedFood: (food: ScannedFood | null) => void;
  creditBalance: number | null;
  isLoading: boolean;
  saveProfile: (profile: Profile) => Promise<boolean>;
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
  weight: '',
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
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialProfile, setInitialProfile] = useState<Profile | null>(null);
  const [scannedFood, setScannedFoodState] = useState<ScannedFood | null | undefined>(undefined);
  const [creditBalance, setCreditBalance] = useState<number | null>(
    getCachedCredits()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  
  const setScannedFood = (food: ScannedFood | null) => {
    setScannedFoodState(food);
  }

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
        setIsLoading(false);
        setProfile(initialProfileState);
        setInitialProfile(JSON.parse(JSON.stringify(initialProfileState))); // Deep copy for comparison
        return;
    }

    try {
        const [profileRes, subRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/api/event/subscription/status`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (profileRes.status === 401 || subRes.status === 401) {
            toast({
                variant: 'destructive',
                title: 'Session Expired',
                description: 'Please log in again to continue.',
            });
            localStorage.clear();
            router.push('/login');
            return;
        }

        const subData = subRes.ok ? await subRes.json() : { isSubscribed: false };
        let userProfile = initialProfileState;

        if (profileRes.ok) {
            const profiles = await profileRes.json();
            if (profiles && profiles.length > 0) {
                const p = profiles[0];
                userProfile = {
                    ...p,
                    birthDate: p.birthDate ? new Date(p.birthDate) : null,
                    weight: p.weight || '',
                };
            }
        } else if (profileRes.status !== 404) {
             console.error('Failed to fetch profile', profileRes.statusText);
        }

        const finalProfile = { ...userProfile, isSubscribed: subData.isSubscribed };
        setProfile(finalProfile);
        setInitialProfile(JSON.parse(JSON.stringify(finalProfile))); // Deep copy for comparison

    } catch (error) {
      console.error('Failed to load user data', error);
      const finalProfile = { ...initialProfileState, isSubscribed: false };
      setProfile(finalProfile);
      setInitialProfile(JSON.parse(JSON.stringify(finalProfile)));
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const saveProfile = useCallback(
    async (profileData: Profile): Promise<boolean> => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
        return false;
      }

      if (!profileData.isSubscribed) {
        setSubscriptionModalOpen(true);
        return false;
      }
      
      const isNewProfile = !profileData.id;
      const endpoint = isNewProfile ? `${API_BASE_URL}/api/profile` : `${API_BASE_URL}/api/profile/${profileData.id}`;
      const method = isNewProfile ? 'POST' : 'PUT';

      // The backend calculates age, so we don't send it.
      // And we don't send isSubscribed as it's a client-side flag
      const { age, isSubscribed, ...profileToSend } = profileData;

      // Ensure weight is a number before sending
      const finalPayload = {
        ...profileToSend,
        weight: parseFloat(String(profileToSend.weight)) || 0,
      };


      try {
        const response = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(finalPayload)
        });
        
        if (response.status === 403) {
            setSubscriptionModalOpen(true);
            return false;
        }

        // Handle PUT success (204 No Content)
        if (method === 'PUT' && response.status === 204) {
             const updatedProfileWithSub = { ...profileData, isSubscribed: profileData.isSubscribed };
             setProfile(updatedProfileWithSub);
             setInitialProfile(JSON.parse(JSON.stringify(updatedProfileWithSub)));
             return true;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save profile.');
        }

        // Handle POST success (returns new profile)
        if (method === 'POST') {
            const newProfile = await response.json();
            const finalProfile = { ...newProfile, isSubscribed: profileData.isSubscribed };
            setProfile(finalProfile);
            setInitialProfile(JSON.parse(JSON.stringify(finalProfile)));
        }

        return true;

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: error.message,
        });
        return false;
      }
    },
    [toast, setSubscriptionModalOpen]
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
      });

      if (creditRes.ok) {
        const data = await creditRes.json();
        const newBalance = data.credits;
        setCreditBalance(newBalance);
        localStorage.setItem('creditBalance', JSON.stringify(newBalance));
      } else {
        localStorage.removeItem('creditBalance');
        setCreditBalance(null);
      }
    } catch (error) {
      console.error('Failed to fetch credit balance', error);
      setCreditBalance(null);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    updateCreditBalance();
  }, [fetchProfile, updateCreditBalance]);

  const value = {
    profile,
    initialProfile,
    setProfile,
    scannedFood,
    setScannedFood,
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
