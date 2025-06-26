'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { BackgroundImage } from '@/components/background-image';
import { textToSpeech } from '@/ai/flows/text-to-speech';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function SallyPage() {
  const [sallyResponse, setSallyResponse] = useState<string>(
    "I'm your personal assistant. Ask me anything about your body."
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

    setIsLoading(true);
    setSallyResponse(`Thinking about: "${userInput}"`);

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/sally/body-assessment`,
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
      setIsLoading(false);
    }
  };

  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="abstract purple"
        className="blur-sm"
      />
      <div className="z-10 flex h-screen flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-black/30 p-4 backdrop-blur-sm">
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <ArrowLeft size={20} />
            <span className="font-bold">Sally AI Assistant</span>
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
          <div className="mb-6 h-24 w-24 flex-shrink-0 rounded-full bg-primary shadow-lg"></div>
          <div className="flex min-h-[100px] w-full max-w-lg items-center justify-center rounded-lg bg-black/30 p-6 backdrop-blur-sm">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <p className="text-lg text-foreground">{sallyResponse}</p>
            )}
          </div>
        </main>

        <footer className="border-t border-white/10 bg-black/30 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={handleMicClick}
              size="icon"
              className={`h-16 w-16 rounded-full shadow-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              <Mic size={32} />
            </Button>
          </div>
        </footer>
        {audioUrl && <audio ref={audioRef} src={audioUrl} hidden />}
      </div>
    </>
  );
}
