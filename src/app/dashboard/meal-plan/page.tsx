'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BackgroundImage } from '@/components/background-image';
import { Home, UtensilsCrossed, Mic, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { cn } from '@/lib/utils';

type ScannedFood = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/meal-plan', icon: UtensilsCrossed, label: 'Meal Plan' },
  { href: '/dashboard/sally', icon: Mic, label: 'SallyPA' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function MealPlanPage() {
  const [foods, setFoods] = useState<ScannedFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  // --- Sally State ---
  const [sallyResponse, setSallyResponse] = useState<string>(
    "Ask me about this meal and I'll tell you everything."
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isSallyLoading, setIsSallyLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Speech Recognition and Audio Playback ---
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch((e) => console.error('Audio play failed', e));
    }
  }, [audioUrl]);

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
        toast({
          variant: 'destructive',
          title: 'Speech Error',
          description: `Could not recognize speech: ${event.error}`,
        });
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

  // --- Data Fetching ---
  useEffect(() => {
    const fetchFoodReferences = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'You must be logged in to view your meal plan.',
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/food/references`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch meal plan.');
        }

        const data = await response.json();
        const formattedData: ScannedFood[] = data.map((food: any) => ({
          id: food.Id,
          name: food.Name,
          calories: food.Calories,
          protein: food.Protein,
          fat: food.Fat,
          carbs: food.Carbs,
        }));
        setFoods(formattedData);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            'Could not fetch your meal plan. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodReferences();
  }, [toast]);

  const totals = useMemo(() => {
    return foods.reduce(
      (acc, food) => {
        acc.calories += food.calories || 0;
        acc.protein += food.protein || 0;
        acc.fat += food.fat || 0;
        acc.carbs += food.carbs || 0;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  }, [foods]);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setAudioUrl(null);
      setIsRecording(true);
      setSallyResponse('Listening...');
      recognitionRef.current?.start();
    }
  };

  const handleApiCall = async (userInput: string) => {
    if (!userInput.trim()) return;

    setIsSallyLoading(true);
    setSallyResponse(`Thinking about: "${userInput}"`);

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in.',
      });
      setIsSallyLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sally/meal-planner`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            agentName: 'Sally',
            clientDialogue: userInput,
          }),
        }
      );

      if (response.status === 429) {
        throw new Error('Daily request limit reached.');
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to get a response from Sally.'
        );
      }

      const data = await response.json();
      setSallyResponse(data.agentDialogue);

      const audioResponse = await textToSpeech(data.agentDialogue);
      if (audioResponse?.media) {
        setAudioUrl(audioResponse.media);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      setSallyResponse('Sorry, I had trouble with that. Please try again.');
    } finally {
      setIsSallyLoading(false);
    }
  };

  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="food pattern"
        className="blur-sm"
      />
      <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-black/60 p-5 pb-40 backdrop-blur-sm">
        <header className="mb-5 flex w-full max-w-2xl shrink-0 items-center justify-between px-4">
          <div className="h-[75px] w-[150px] shrink-0 text-left">
            <Image
              src="/scaneats-logo.png"
              alt="ScanEats Logo"
              width={150}
              height={75}
              className="block h-full w-full object-contain"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-white" />
            <p className="mt-4 text-white">Loading your meal plan...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex shrink-0 flex-col items-center">
              <div className="mb-2 text-3xl font-medium text-white [text-shadow:0_0_10px_white]">
                {totals.calories.toFixed(0)}
              </div>
              <div className="rounded-full bg-zinc-800/70 px-3 py-1.5 text-sm tracking-wide text-white">
                Total Calories
              </div>
            </div>

            <div className="mb-6 flex w-full max-w-xl shrink-0 flex-wrap items-stretch justify-around gap-4">
              <div className="flex min-w-[90px] flex-1 flex-col items-center justify-center rounded-xl border border-white/10 bg-purple-900/80 p-5 text-center text-white shadow-[0_0_10px_rgba(106,27,154,0.5)] transition-transform hover:-translate-y-1">
                <div className="mb-2 text-lg font-normal text-white [text-shadow:0_0_10px_white]">
                  Protein
                </div>
                <div className="text-2xl font-semibold text-white [text-shadow:0_0_10px_white]">
                  {totals.protein.toFixed(0)}g
                </div>
              </div>
              <div className="flex min-w-[90px] flex-1 flex-col items-center justify-center rounded-xl border border-white/10 bg-purple-900/80 p-5 text-center text-white shadow-[0_0_10px_rgba(106,27,154,0.5)] transition-transform hover:-translate-y-1">
                <div className="mb-2 text-lg font-normal text-white [text-shadow:0_0_10px_white]">
                  Fat
                </div>
                <div className="text-2xl font-semibold text-white [text-shadow:0_0_10px_white]">
                  {totals.fat.toFixed(0)}g
                </div>
              </div>
              <div className="flex min-w-[90px] flex-1 flex-col items-center justify-center rounded-xl border border-white/10 bg-purple-900/80 p-5 text-center text-white shadow-[0_0_10px_rgba(106,27,154,0.5)] transition-transform hover:-translate-y-1">
                <div className="mb-2 text-lg font-normal text-white [text-shadow:0_0_10px_white]">
                  Carbs
                </div>
                <div className="text-2xl font-semibold text-white [text-shadow:0_0_10px_white]">
                  {totals.carbs.toFixed(0)}g
                </div>
              </div>
            </div>

            <button
              onClick={handleMicClick}
              className={cn(
                'my-10 flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-white/20 text-white transition-transform',
                isRecording
                  ? 'animate-pulse bg-red-600'
                  : 'animate-breathing-glow-purple bg-gradient-to-r from-purple-900 to-indigo-900'
              )}
              disabled={isSallyLoading}
            >
              <Mic
                className="text-6xl [text-shadow:0_0_8px_rgba(255,255,255,0.8)]"
              />
            </button>

            <div className="inline-block max-w-[85%] shrink-0 rounded-lg border-l-4 border-purple-500 bg-transparent p-3 text-center text-lg font-normal text-white shadow-[0_0_15px_rgba(0,0,0,0.4),_0_0_5px_rgba(0,0,0,0.3)] [text-shadow:0_0_6px_rgba(255,255,255,0.8),_0_0_3px_rgba(255,255,255,0.6)]">
              {isSallyLoading ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              ) : (
                sallyResponse
              )}
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-[30px] left-1/2 z-50 flex w-[85%] max-w-[460px] -translate-x-1/2 flex-col items-center">
        <div className="mb-2.5 text-sm font-normal text-gray-400">
          Powered by ScanEats
        </div>
        <div className="flex w-full items-center justify-around rounded-3xl bg-stone-900/85 p-4 shadow-[0_0_12px_1px_rgba(127,0,255,0.65),0_0_25px_5px_rgba(127,0,255,0.35),0_2px_8px_rgba(0,0,0,0.3)] backdrop-blur-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  'group flex flex-1 cursor-pointer flex-col items-center justify-center border-none bg-transparent p-2 text-center text-white transition-opacity'
                )}
              >
                <div
                  className={cn(
                    'mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-transparent text-4xl text-gray-400 transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_10px_2px_hsl(var(--primary)),_0_0_20px_5px_hsla(var(--primary),0.4)]',
                    isActive &&
                      'scale-110 bg-primary text-white shadow-[0_0_10px_2px_hsl(var(--primary)),_0_0_20px_5px_hsla(var(--primary),0.4)]'
                  )}
                >
                  <item.icon className="h-9 w-9" />
                </div>
                <span
                  className={cn(
                    'mt-0.5 text-base font-normal text-gray-400 transition-colors group-hover:text-white',
                    isActive && 'text-white'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} hidden />}
    </>
  );
}
