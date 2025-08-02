
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


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const MealPlanView = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, setSubscriptionModalOpen, updateCreditBalance, scannedFood } = useUserData();
  const [sallyResponse, setSallyResponse] = useState<string>(
    "Ask me about this meal and I'll tell you everything."
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isSallyLoading, setIsSallyLoading] = useState(false);
  const [sallyProgress, setSallyProgress] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

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
        calories: scannedFood.calories || 0,
        protein: scannedFood.protein || 0,
        fat: scannedFood.fat || 0,
        carbs: scannedFood.carbohydrates || 0,
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

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
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

    if (!profile?.isSubscribed) {
      setSubscriptionModalOpen(true);
      return;
    }

    setIsSallyLoading(true);
    setSallyProgress(10);
    setSallyResponse(`Thinking about: "${userInput}"`);

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

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Authentication token not found.");
      
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

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('INSUFFICIENT_CREDITS');
        }
        let errorMsg = "Sally failed to respond";
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      
      const result = await response.json();
      
      await updateCreditBalance(true);
      
      setSallyResponse(result.agentDialogue);
      
      if (result.audioUrl && audioRef.current) {
          audioRef.current.src = result.audioUrl;
          audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }

    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_CREDITS') {
        toast({
          variant: 'destructive',
          title: 'No Credits Left',
          description: 'Please purchase more credits to talk to Sally.',
          action: <Button onClick={() => router.push('/credits')}>Buy Credits</Button>
        });
        setSallyResponse("I'd love to chat, but it looks like you're out of credits.");
      } else {
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

        {scannedFood === undefined ? (
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
