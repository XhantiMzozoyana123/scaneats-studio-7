'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { X, Mic, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { textToSpeech } from '@/ai/flows/text-to-speech';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function SallyPage() {
  const [sallyResponse, setSallyResponse] = useState<string>(
    "I'm your personal assistant, ask me anything about your body."
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

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

  const handleMicClick = () => {
    if (isRecording || isLoading) {
      recognitionRef.current?.stop();
    } else {
      setAudioUrl(null);
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const handleApiCall = async (userInput: string) => {
    if (!userInput.trim()) return;

    setIsLoading(true);

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.scaneats.app/api/sally/body-assessment`,
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
      try {
        const audioData = await textToSpeech({ text: data.agentDialogue });
        if (audioData.media) {
          setAudioUrl(audioData.media);
        }
      } catch (ttsError) {
        console.error('Error during TTS call:', ttsError);
        toast({
          variant: 'destructive',
          title: 'Audio Error',
          description: 'Could not generate audio for the response.',
        });
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      setSallyResponse('Sorry, I had trouble with that. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-100 to-blue-50">
      <Link
        href="/dashboard"
        aria-label="Back to Dashboard"
        className="absolute top-6 left-6 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/50 text-gray-700 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white/70 hover:text-black"
      >
        <X className="h-5 w-5" />
      </Link>

      <div className="flex w-[320px] flex-col items-center gap-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_20px_55px_8px_rgba(110,100,150,0.45)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="relative flex h-[130px] w-[130px] items-center justify-center">
          <div
            className="absolute top-1/2 left-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 animate-breathe-glow-sally rounded-full"
            style={{
              background:
                'radial-gradient(circle at center, rgba(255, 235, 255, 0.7) 10%, rgba(200, 190, 255, 0.8) 40%, rgba(170, 220, 255, 1.0) 65%, rgba(200, 240, 255, 1.0) 72%, rgba(135, 206, 250, 0) 80%)',
            }}
          />

          {isRecording && (
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2">
              <div className="absolute top-0 left-0 h-full w-full animate-siri-wave-1 rounded-full border-2 border-white/60"></div>
              <div className="absolute top-0 left-0 h-full w-full animate-siri-wave-2 rounded-full border-2 border-white/60"></div>
              <div className="absolute top-0 left-0 h-full w-full animate-siri-wave-3 rounded-full border-2 border-white/60"></div>
              <div className="absolute top-0 left-0 h-full w-full animate-siri-wave-4 rounded-full border-2 border-white/60"></div>
            </div>
          )}

          <button
            onClick={handleMicClick}
            disabled={isLoading}
            className={cn(
              'relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#4629B0] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.4),0_0_15px_5px_rgba(255,255,255,0.8),0_0_30px_15px_rgba(255,255,255,0.5),0_0_50px_25px_rgba(220,230,255,0.3)] transition-all active:scale-95 active:bg-[#3c239a] active:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.3),0_0_10px_3px_rgba(255,255,255,0.7),0_0_20px_10px_rgba(255,255,255,0.4),0_0_40px_20px_rgba(220,230,255,0.2)]',
              isLoading && 'cursor-not-allowed'
            )}
            aria-label="Activate Voice AI"
          >
            {isLoading ? (
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            ) : (
              <Mic
                className="h-10 w-10 text-white"
                style={{
                  textShadow:
                    '0 1px 2px rgba(0,0,0,0.2), 0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(180,140,255,0.7)',
                }}
              />
            )}
          </button>
        </div>

        <div className="w-full rounded-2xl border border-white/40 bg-white/80 p-3 text-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_10px_30px_3px_rgba(100,90,140,0.45)] backdrop-blur-sm backdrop-saturate-150">
          <p className="text-[13px] leading-tight text-black">
            <strong>Sally</strong>
            <span className="text-gray-600"> - {sallyResponse}</span>
          </p>
        </div>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} hidden />}
    </div>
  );
}
