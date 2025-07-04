
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { BackgroundImage } from '@/components/background-image';
import { Mic, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { textToSpeech } from '@/ai/flows/text-to-speech';

type ScannedFood = {
  id: number;
  name?: string;
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
          description: `Could not recognize speech: ${event.error}. Please check your microphone and try again.`,
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
    setIsLoading(true);
    const storedFood = localStorage.getItem('scannedFood');
    if (storedFood) {
      try {
        const parsedFood = JSON.parse(storedFood);
            console.log('Stored food data:', parsedFood);

        const formattedData: ScannedFood = {
          id: parsedFood.id,
          name: parsedFood.name || 'Unknown Food',
          calories: parsedFood.total || parsedFood.Logging?.total || 0, // Assuming 'total' represents calories
          protein: parsedFood.protien || parsedFood.Logging?.protien || 0, // Corrected spelling
          fat: parsedFood.fat || parsedFood.Logging?.fat || 0,
          carbs: parsedFood.carbs || parsedFood.Logging?.carbs || 0,
        };
        setFoods([formattedData]);
      } catch (error) {
        console.error('Error parsing stored food data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load stored meal plan data.',
        });
      }
    }
    setIsLoading(false);
  }, [toast]);

  const totals = useMemo(() => {
    return foods.reduce(
      (acc, food) => {
        acc.calories += food?.calories || 0;
        acc.protein += food?.protein || 0;
        acc.fat += food?.fat || 0;
        acc.carbs += food?.carbs || 0;
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
        `https://gjy9aw4wpj.loclx.io/api/sally/meal-planner`,
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
      
      // Call Genkit flow for Text-to-Speech
      if (data.agentDialogue) {
        try {
          const { media } = await textToSpeech({ text: data.agentDialogue });
          if (media) {
            setAudioUrl(media);
          }
        } catch (ttsError) {
          console.error('Error during TTS call:', ttsError);
          console.log('TTS Input Text:', data.agentDialogue);
          toast({
            variant: 'destructive',
            title: 'Audio Error',
            description: 'Could not generate audio for the response. The text-to-speech service may be unavailable.',
          });
        }
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
      <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-black/60 p-5 pb-28 backdrop-blur-sm">
        <header className="mb-5 flex w-full max-w-2xl shrink-0 items-center justify-start px-4">
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
            {foods.length > 0 ? (
              <>
                <div className="mb-6 flex shrink-0 flex-col items-center">
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
              <div className="flex flex-1 flex-col items-center justify-center">
                <p className="text-white">No food scanned yet.</p>
              </div>
            )}

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
              <Mic
                className="h-16 w-16"
              />
            </button>

            <div className="max-w-md p-3 text-center text-lg font-normal text-muted-foreground">
              {isSallyLoading ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              ) : (
                sallyResponse
              )}
            </div>
          </>
        )}
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} hidden />}
    </>
  );
}
