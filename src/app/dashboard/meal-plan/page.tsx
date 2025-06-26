'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { BackgroundImage } from '@/components/background-image';
import { Beef, Mic, Milk, Wheat, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { textToSpeech } from '@/ai/flows/text-to-speech';

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

const MacroCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) => (
  <div className="flex min-w-[90px] flex-1 flex-col items-center justify-center rounded-xl border border-white/10 bg-primary/80 p-3 text-center text-white shadow-lg transition-transform hover:scale-105">
    <div className="mb-1 text-base font-medium [text-shadow:_0_0_10px_white]">
      {label}
    </div>
    <div className="text-xl font-semibold [text-shadow:_0_0_10px_white]">
      {value}
    </div>
  </div>
);

export default function MealPlanPage() {
  const [foods, setFoods] = useState<ScannedFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <>
        <BackgroundImage
          src="https://placehold.co/1920x1080.png"
          data-ai-hint="abstract food pattern"
          className="blur-sm"
        />
        <div className="z-10 flex h-screen w-full flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-white" />
          <p className="mt-4 text-white">Loading your meal plan...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="abstract food pattern"
        className="blur-sm"
      />
      <div className="z-10 flex h-screen w-full flex-col items-center px-4 pt-4 pb-28">
        <header className="w-full max-w-lg self-start">
          <Image
            src="/scaneats-logo.png"
            alt="ScanEats Logo"
            width={80}
            height={80}
          />
        </header>

        <section className="mb-4 text-center">
          <div className="text-4xl font-bold text-white [text-shadow:_0_0_10px_white]">
            {totals.calories.toFixed(0)}
          </div>
          <div className="mt-1 inline-block rounded-full bg-black/50 px-3 py-1 text-xs text-gray-200">
            Total Calories Today
          </div>
        </section>

        <section className="mb-4 flex w-full max-w-md flex-wrap justify-center gap-2">
          <MacroCard
            label="Protein"
            value={`${totals.protein.toFixed(0)}g`}
            icon={Beef}
          />
          <MacroCard
            label="Fat"
            value={`${totals.fat.toFixed(0)}g`}
            icon={Milk}
          />
          <MacroCard
            label="Carbs"
            value={`${totals.carbs.toFixed(0)}g`}
            icon={Wheat}
          />
        </section>

        {/* --- Sally Response UI --- */}
        <section className="mt-4 flex w-full max-w-lg flex-1 items-center justify-center space-y-4 rounded-lg bg-black/30 p-4 text-center backdrop-blur-sm">
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 h-12 w-12 flex-shrink-0 rounded-full bg-primary"></div>
            {isSallyLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <p className="text-foreground">{sallyResponse}</p>
            )}
          </div>
        </section>

        <footer className="w-full max-w-lg pt-4">
          <Button
            onClick={handleMicClick}
            size="icon"
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <Mic size={32} />
          </Button>
        </footer>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} hidden />}
    </>
  );
}
