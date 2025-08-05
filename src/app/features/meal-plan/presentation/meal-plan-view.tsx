
'use client';

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import {
  Loader2,
  Mic,
} from 'lucide-react';

import { useToast } from '@/app/shared/hooks/use-toast';
import { useUserData } from '@/app/shared/context/user-data-context';
import { cn } from '@/app/shared/lib/utils';
import { API_BASE_URL } from '@/app/shared/lib/api';
import type { View } from '@/app/features/dashboard/dashboard.types';
import { MealService } from '../application/meal.service';
import { MealApiRepository } from '../data/meal-api.repository';


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const mealRepository = new MealApiRepository();
const mealService = new MealService(mealRepository);

export const MealPlanView = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, setSubscriptionModalOpen, scannedFood, setScannedFood } = useUserData();
  const [sallyResponse, setSallyResponse] = useState<string>(
    "Ask me about this meal and I'll tell you everything."
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isSallyLoading, setIsSallyLoading] = useState(false);
  const [sallyProgress, setSallyProgress] = useState(0);
  const recognitionRef = useRef<any>(null);
  const [isMealLoading, setIsMealLoading] = useState(true);
  
  useEffect(() => {
    const fetchLastMeal = async () => {
        setIsMealLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast({ variant: 'destructive', title: 'Not authorized' });
            setIsMealLoading(false);
            setScannedFood(null); // No food if not logged in
            return;
        }
        try {
            const lastMeal = await mealService.getLastMealPlan(token);
            setScannedFood(lastMeal);
        } catch (error) {
            console.error('Failed to fetch last meal:', error);
            setScannedFood(null); // Set to null on error
        } finally {
            setIsMealLoading(false);
        }
    };

    // Fetch meal plan when the component mounts, regardless of scannedFood state.
    // The UserDataContext will hold the state if navigated from scan page.
    // This ensures data is fresh if user navigates here directly.
    if (scannedFood === undefined) {
        fetchLastMeal();
    } else {
        setIsMealLoading(false);
    }
  }, [setScannedFood, toast, scannedFood]);


  useEffect(() => {
    if (isSallyLoading) {
      const interval = setInterval(() => {
        setSallyProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isSallyLoading]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleApiCall(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
           toast({
            variant: 'destructive',
            title: 'Microphone Access Denied',
            description:
              'Please allow microphone access in your browser settings to use this feature.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Speech Error',
            description: `Could not recognize speech: ${event.error}. Please try again.`,
          });
        }
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      toast({
        variant: 'destructive',
        title: 'Not Supported',
        description: 'Speech recognition is not supported in this browser.',
      });
    }
  }, [toast]);

  const totals = useMemo(() => {
    if (!scannedFood) {
      return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    }
    return {
        calories: scannedFood.Total || 0,
        protein: scannedFood.Protien || 0,
        fat: scannedFood.Fat || 0,
        carbs: scannedFood.Carbs || 0,
    }
  }, [scannedFood]);

  const handleMicClick = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      // Proactively request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setSallyResponse('Listening...');
      recognitionRef.current?.start();
    } catch (error) {
      console.error('Microphone permission error:', error);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description:
          'Please allow microphone access in your browser settings to use this feature.',
      });
    }
  };

  const handleApiCall = async (userInput: string) => {
    if (!userInput.trim()) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ variant: 'destructive', title: 'Not Logged In', description: 'Please log in to talk to Sally.' });
        router.push('/login');
        return;
    }

    if (!profile) {
      toast({ variant: 'destructive', title: 'Profile not loaded' });
      return;
    }

    if (!scannedFood) {
      toast({
        variant: 'destructive',
        title: 'No Meal Data',
        description: 'Please scan a food item before asking Sally.',
      });
      setSallyResponse('Scan a meal first, then we can talk!');
      setIsSallyLoading(false);
      return;
    }

    setIsSallyLoading(true);
    setSallyProgress(10);
    setSallyResponse(`Thinking about: "${userInput}"`);


    try {
      const response = await fetch(`${API_BASE_URL}/api/sally/meal-planner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ClientName: profile?.name || 'User',
            ClientDialogue: userInput,
            FoodName: scannedFood.name,
            FoodId: scannedFood.id
          }),
      });

      if (response.status === 401) {
          toast({ variant: 'destructive', title: 'Session Expired', description: 'Please log in again.' });
          router.push('/login');
          throw new Error('Unauthorized');
      }

      if (response.status === 403) {
          setSubscriptionModalOpen(true);
          throw new Error('Subscription required');
      }
      
      if (!response.ok) {
        let errorMsg = "Sally failed to respond";
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      
      const result = await response.json();
      
      setSallyResponse(result.agentDialogue);

    } catch (error: any) {
      if (error.message !== 'Subscription required' && error.message !== 'Unauthorized') {
        setSallyResponse('Sorry, I had trouble with that. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'An error occurred while talking to Sally.',
        });
      }
    } finally {
      setSallyProgress(100);
      setTimeout(() => setIsSallyLoading(false), 500);
    }
  };


  return (
    <>
      <div className="fixed inset-0 -z-10">
        <video
          src="https://gallery.scaneats.app/images/MealPlannerPage.webm"
          className="h-full w-full object-cover blur-sm"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative flex h-full w-full flex-col items-center overflow-y-auto bg-black/60 p-5 pb-28 backdrop-blur-sm">
        <header className="absolute top-0 left-0 z-20 h-24 w-24 p-2">
            <Image
              src="https://gallery.scaneats.app/images/ScanEatsLogo.png"
              alt="ScanEats Logo"
              width={80}
              height={80}
              className="block h-full w-full object-contain"
            />
        </header>

        {isMealLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-white" />
            <p className="mt-4 text-white">Loading your meal plan...</p>
          </div>
        ) : (
          <div className="flex w-full flex-1 flex-col items-center justify-center">
            {scannedFood ? (
              <>
                <div className="mb-6 flex shrink-0 flex-col items-center">
                   <div className="mb-2 text-2xl font-semibold text-white">
                    {scannedFood.name}
                  </div>
                  <div className="text-5xl font-bold text-white drop-shadow-[0_0_10px_hsl(var(--primary))]">
                    {totals.calories.toFixed(0)}
                  </div>
                  <div className="mt-2 rounded-full bg-card/50 px-4 py-1.5 text-sm tracking-wide text-muted-foreground">
                    Total Calories
                  </div>
                </div>

                <div className="mb-6 grid w-full max-w-xl shrink-0 grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/20 p-4 text-center text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1">
                    <div className="mb-1 text-lg font-normal text-accent">
                      Protein
                    </div>
                    <div className="text-2xl font-semibold">
                      {totals.protein.toFixed(0)}g
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/20 p-4 text-center text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1">
                    <div className="mb-1 text-lg font-normal text-accent">
                      Fat
                    </div>
                    <div className="text-2xl font-semibold">
                      {totals.fat.toFixed(0)}g
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/20 p-4 text-center text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1">
                    <div className="mb-1 text-lg font-normal text-accent">
                      Carbs
                    </div>
                    <div className="text-2xl font-semibold">
                      {totals.carbs.toFixed(0)}g
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-white">
                  No food scanned yet. Scan an item to get started!
                </p>
                 <Button onClick={() => onNavigate('scan')} className="mt-4">
                  Scan Food
                </Button>
              </div>
            )}

            {scannedFood && (
            <>
            <button
              onClick={handleMicClick}
              disabled={isSallyLoading || isRecording}
              className={cn(
                'my-10 flex h-[120px] w-[120px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-full bg-primary text-white shadow-[0_0_15px_5px_hsl(var(--primary)/0.4)] transition-all hover:scale-105',
                isRecording
                  ? 'animate-pulse bg-red-600'
                  : 'animate-breathe-glow'
              )}
            >
              <Mic className="h-16 w-16" />
            </button>

            <div className="w-full max-w-md p-3 text-center text-lg font-normal text-muted-foreground">
              {isSallyLoading ? (
                <div className="space-y-2">
                   <Progress value={sallyProgress} className="w-full" />
                   <p className="text-sm">Sally is thinking...</p>
                </div>
              ) : (
                sallyResponse
              )}
            </div>
            </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
