

'use client';

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

import {
  Home,
  UtensilsCrossed,
  Mic,
  User as UserIcon,
  Settings,
  Loader2,
  Camera,
  RefreshCw,
  Send,
  AlertTriangle,
  X,
  LogOut,
  UserCircle,
  Lock,
  Trash2,
  Wallet,
  Repeat,
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Calendar as CalendarIcon,
  XCircle,
  Upload,
  Smartphone,
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/context/user-data-context';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { runProtectedAction } from '@/services/checkpointService';
import type { FoodScanNutritionOutput } from '@/ai/flows/food-scan-nutrition';
import type { GetMealInsightsOutput } from '@/ai/flows/meal-insights';
import type { TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import type { SallyHealthInsightsOutput } from '@/ai/flows/sally-health-insights';
import { API_BASE_URL } from '@/lib/api';


type View = 'home' | 'meal-plan' | 'sally' | 'profile' | 'settings' | 'scan';


// --- Views (previously separate pages) ---

const HomeView = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
  return (
    <>
      <div className="fixed inset-0 -z-10">
        <video
          src="https://gallery.scaneats.app/images/ScanFoodNEW.webm"
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <header className="absolute top-1 left-1 z-10 h-10 w-24">
        <Image
          src="https://gallery.scaneats.app/images/ScanEatsLogo.png"
          alt="ScanEats Logo"
          fill
          style={{ objectFit: 'contain' }}
        />
      </header>

      <main className="relative z-10 flex h-full flex-col items-center justify-center overflow-y-auto px-4 pb-28 pt-12 text-center text-white">
        <div className="space-y-4">
          <h1
            className="title-gradient font-headline text-5xl font-bold md:text-6xl"
            style={{
              textShadow:
                '0px 2px 2px rgba(0, 0, 0, 0.25), 0px 0px 10px rgba(190, 100, 255, 0.45)',
            }}
          >
            ScanEats
          </h1>
          <h2 className="font-body text-xl font-light text-gray-200 opacity-90 md:text-2xl">
            Welcome home, wink wink
          </h2>
          <p className="mx-auto max-w-md font-body text-base leading-relaxed text-gray-300 opacity-95 md:text-lg">
            Meet Sally, your personal assistant who’ll help you stay on track
            with your meals and let you know if you&apos;re eating well —
            without the need to constantly go for health foods.
          </p>
        </div>

        <Button
          onClick={() => onNavigate('scan')}
          className="mt-8 h-[199px] w-full max-w-[336px] rounded-3xl bg-primary/90 text-xl font-light uppercase tracking-[2px] text-white animate-breathe-glow transition-all hover:animate-none hover:shadow-[0_12px_70px_20px_rgba(140,30,255,0.8)] focus:scale-105"
        >
          Scan Food
        </Button>
      </main>
    </>
  );
};


const ScanView = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
  const { toast } = useToast();
  const { setSubscriptionModalOpen, updateCreditBalance } = useUserData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const router = useRouter();

  const [cameraState, setCameraState] = useState<
    'idle' | 'starting' | 'running' | 'denied' | 'error' | 'nocamera'
  >('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Cleanup function to stop video tracks when component unmounts or view changes
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      setCameraState('nocamera');
      return;
    }
    setCameraState('starting');

    const constraints: MediaStreamConstraints[] = [
      { video: { facingMode: { exact: 'environment' } }, audio: false },
      { video: { facingMode: 'environment' }, audio: false },
      { video: true, audio: false },
    ];

    let stream: MediaStream | null = null;
    let success = false;

    for (const constraint of constraints) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint);
        success = true;
        break;
      } catch (err) {
        console.warn('Constraint failed:', constraint, err);
      }
    }

    if (success && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      try {
        await videoRef.current.play();
        setCameraState('running');
      } catch (playErr) {
        console.error('Video play failed:', playErr);
        toast({
          variant: 'destructive',
          title: 'Camera Error',
          description: 'Could not start the video stream.',
        });
        setCameraState('error');
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description:
          'Please enable camera permissions in your browser settings.',
      });
      setCameraState('denied');
    }
  };

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || cameraState !== 'running') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUri);
    }
  }, [cameraState]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSendScan = async () => {
    if (!capturedImage) return;

    setIsSending(true);
    const token = localStorage.getItem('authToken');

    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to scan food.',
      });
      setIsSending(false);
      return;
    }

    try {
      const scanResult = await runProtectedAction<FoodScanNutritionOutput>(
        token,
        'food-scan-nutrition', 
        { photoDataUri: capturedImage },
      );
      
      await updateCreditBalance(true); 

      // Directly use properties from the output schema
      const { foodIdentification, nutritionInformation } = scanResult;
      const simplifiedResult = {
        name: foodIdentification.name,
        calories: nutritionInformation.calories,
        protein: nutritionInformation.protein,
        fat: nutritionInformation.fat,
        carbohydrates: nutritionInformation.carbohydrates,
      }

      localStorage.setItem('scannedFood', JSON.stringify(simplifiedResult));
      
      toast({
          title: 'Success!',
          description: `Identified: ${simplifiedResult.name}.`,
      });
      onNavigate('meal-plan');

    } catch (error: any) {
      if (error.message === 'SUBSCRIPTION_REQUIRED') {
        setSubscriptionModalOpen(true);
      } else if (error.message === 'INSUFFICIENT_CREDITS') {
        toast({
          variant: 'destructive',
          title: 'No Credits Left',
          description: 'Please purchase more credits to continue scanning.',
          action: <Button onClick={() => router.push('/credits')}>Buy Credits</Button>
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Scan Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  if (!isMobile) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
         <div className="fixed inset-0 -z-10">
            <video
              src="https://gallery.scaneats.app/images/ScanHomePage.webm"
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        <main className="z-10 rounded-lg bg-background/80 p-8 shadow-lg">
           <Smartphone className="mx-auto h-16 w-16 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">Mobile-Only Feature</h2>
          <p className="mt-2 text-muted-foreground">
            The food scanner is designed for mobile devices.
            <br /> Please open this page on your phone to use the camera.
          </p>
          <Button onClick={() => onNavigate('home')} className="mt-6">Go Back Home</Button>
        </main>
      </div>
    );
  }
  
  return (
    <>
      <div className="fixed inset-0 -z-10">
        <video
          src="https://gallery.scaneats.app/images/ScanFoodNEW.webm"
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <main className="container z-10 mx-auto flex h-full flex-col items-center justify-center overflow-y-auto p-4 pb-28">
        <div className="w-full max-w-sm space-y-4">
          <div className="relative w-full overflow-hidden rounded-2xl border-4 border-primary/50 shadow-lg bg-black aspect-[9/16]">
            {capturedImage ? (
              <Image
                src={capturedImage}
                alt="Captured food"
                fill
                className="object-contain"
              />
            ) : (
               <>
                <video
                  ref={videoRef}
                  className={cn("h-full w-full object-cover", {
                     'hidden': cameraState !== 'running'
                  })}
                  playsInline
                  muted
                  autoPlay
                />
                {cameraState !== 'running' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white bg-black/50">
                    {cameraState === 'starting' && <Loader2 className="h-12 w-12 animate-spin" />}
                    {cameraState === 'idle' && (
                       <Button onClick={startCamera} size="lg">
                         <Camera className="mr-2" /> Start Camera
                       </Button>
                    )}
                    {(cameraState === 'denied' || cameraState === 'error' || cameraState === 'nocamera') && (
                       <div className="flex flex-col items-center gap-4">
                          <AlertTriangle className="h-10 w-10 text-destructive" />
                          <p className="font-semibold">Camera Unavailable</p>
                          <p className="text-sm text-muted-foreground">
                             {cameraState === 'denied'
                               ? 'Permission was denied. Please allow camera access in your browser settings.'
                               : 'Could not access the camera. You can try again or upload a photo.'}
                          </p>
                          <div className="flex gap-2">
                             <Button onClick={startCamera} variant="outline" size="sm">Retry</Button>
                             <Button onClick={() => fileInputRef.current?.click()} size="sm">
                                <Upload className="mr-2" /> Upload
                              </Button>
                          </div>
                       </div>
                    )}
                  </div>
                )}
               </>
            )}
          </div>

          <div className="flex justify-center gap-4">
            {capturedImage ? (
              <>
                <Button onClick={handleRetake} variant="outline" className="text-lg py-6 flex-1">
                  <RefreshCw className="mr-2" /> Retake
                </Button>
                <Button onClick={handleSendScan} disabled={isSending} className="text-lg py-6 flex-1 bg-primary">
                  {isSending ? ( <Loader2 className="animate-spin" /> ) : ( <> <Send className="mr-2" /> Analyze </> )}
                </Button>
              </>
            ) : (
              <div className="flex w-full items-center gap-2">
                 <Button onClick={handleCapture} disabled={cameraState !== 'running'} className="h-16 flex-1 rounded-full text-lg bg-primary animate-breathe-glow">
                   <Camera className="mr-2" /> Capture
                 </Button>
                  <Button onClick={() => fileInputRef.current?.click()} size="icon" variant="secondary" className="h-16 w-16 rounded-full">
                     <Upload />
                     <span className="sr-only">Upload Photo</span>
                  </Button>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      </main>
    </>
  );
};


type ScannedFood = {
  id?: number;
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

const MealPlanView = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
  const router = useRouter();
  const [foods, setFoods] = useState<ScannedFood[] | null>(null);
  const { toast } = useToast();
  const { setSubscriptionModalOpen, updateCreditBalance } = useUserData();
  const [sallyResponse, setSallyResponse] = useState<string>(
    "Ask me about this meal and I'll tell you everything."
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isSallyLoading, setIsSallyLoading] = useState(false);
  const [sallyProgress, setSallyProgress] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
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

  const loadFoodFromStorage = useCallback(() => {
     const storedFood = localStorage.getItem('scannedFood');
    if (storedFood) {
      try {
        const parsedFood = JSON.parse(storedFood);
        const formattedData: ScannedFood = {
          id: parsedFood.id,
          name: parsedFood.name || 'Unknown Food',
          calories: parsedFood.calories || 0,
          protein: parsedFood.protein || 0,
          fat: parsedFood.fat || 0,
          carbs: parsedFood.carbohydrates || 0,
        };
        setFoods([formattedData]);
        return [formattedData];
      } catch (error) {
        console.error('Error parsing stored food data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load stored meal plan data.',
        });
        setFoods([]);
        return [];
      }
    } else {
      setFoods([]);
      return [];
    }
  }, [toast]);


  useEffect(() => {
    loadFoodFromStorage();
  }, [loadFoodFromStorage]);

  const totals = useMemo(() => {
    if (!foods) {
      return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    }
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

  // iOS Audio Fix: Pre-load a silent audio on user interaction
  const primeAudio = () => {
    if (audioRef.current && audioRef.current.paused) {
        audioRef.current.src = '/silent.mp3';
        audioRef.current.play().catch(() => {}); // Play and ignore errors on first load
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      primeAudio(); // Prime audio for iOS
      setIsRecording(true);
      setSallyResponse('Listening...');
      recognitionRef.current?.start();
    }
  };

  const handleApiCall = async (userInput: string) => {
    if (!userInput.trim()) return;

    setIsSallyLoading(true);
    setSallyProgress(10);
    setSallyResponse(`Thinking about: "${userInput}"`);

    const token = localStorage.getItem('authToken');
    if (!token) {
        setSubscriptionModalOpen(true);
        setIsSallyLoading(false);
        return;
    }

    let currentFoods = foods;
    if (!currentFoods || currentFoods.length === 0) {
      currentFoods = loadFoodFromStorage();
    }

    if (!currentFoods || currentFoods.length === 0) {
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
      const lastFood = currentFoods[0];
      const nutritionalInfo = {
        calories: lastFood.calories,
        protein: lastFood.protein,
        fat: lastFood.fat,
        carbs: lastFood.carbs,
      };
      
      const insightsPayload = {
        foodItemName: lastFood.name || 'your meal',
        nutritionalInformation: JSON.stringify(nutritionalInfo),
        userQuery: userInput,
      };

      const insightsResult = await runProtectedAction<GetMealInsightsOutput>(token, 'meal-insights', insightsPayload);
      
      const ingredients = insightsResult.ingredients;
      const benefits = insightsResult.healthBenefits;
      const risks = insightsResult.potentialRisks;
      
      const textResponse = `This seems to be made of ${ingredients}. Some benefits are: ${benefits}. However, watch out for: ${risks}.`;
      setSallyResponse(textResponse);
      
      const ttsResult = await runProtectedAction<TextToSpeechOutput>(token, 'text-to-speech', { text: textResponse });
      if (audioRef.current) {
          audioRef.current.src = ttsResult.media;
          audioRef.current.play().catch(e => {
            console.error("Audio play failed", e);
            toast({ variant: 'destructive', title: 'Audio Error', description: 'Could not play audio. Please ensure your device is not in silent mode.' });
          });
      }

      await updateCreditBalance(true);

    } catch (error: any) {
      if (error.message === 'SUBSCRIPTION_REQUIRED') {
        setSubscriptionModalOpen(true);
      } else if (error.message === 'INSUFFICIENT_CREDITS') {
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

        {foods === null ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-white" />
            <p className="mt-4 text-white">Loading your meal plan...</p>
          </div>
        ) : (
          <div className="flex w-full flex-1 flex-col items-center justify-center">
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
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-white">
                  No food scanned yet. Scan an item to get started!
                </p>
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
          </div>
        )}
      </div>
    </>
  );
};

const SallyView = () => {
  const router = useRouter();
  const [sallyResponse, setSallyResponse] = useState<string>(
    "I'm your personal assistant, ask me anything about your body."
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { profile, setSubscriptionModalOpen, updateCreditBalance } = useUserData();
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);


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
  
  // iOS Audio Fix: Pre-load a silent audio on user interaction
  const primeAudio = () => {
    if (audioRef.current && audioRef.current.paused) {
        audioRef.current.src = '/silent.mp3'; 
        audioRef.current.play().catch(() => {}); // Play and ignore errors on first load
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };


  const handleMicClick = () => {
    if (isRecording || isLoading) {
      recognitionRef.current?.stop();
    } else {
      primeAudio(); // Prime audio for iOS
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

 const handleApiCall = async (userInput: string) => {
    if (!userInput.trim() || !profile) return;

    setIsLoading(true);
    setLoadingProgress(10);
    setSallyResponse(`Thinking about: "${userInput}"`);

    const token = localStorage.getItem('authToken');
    if (!token) {
        setSubscriptionModalOpen(true);
        setIsLoading(false);
        return;
    }
    
    try {
        const insightsPayload = {
          userProfile: profile,
          userQuery: userInput,
        };
        const insightsResult = await runProtectedAction<SallyHealthInsightsOutput>(token, 'sally-health-insights', insightsPayload);
        
        const textResponse = insightsResult.response;
        setSallyResponse(textResponse);

        const ttsResult = await runProtectedAction<TextToSpeechOutput>(token, 'text-to-speech', { text: textResponse });
        
        if (audioRef.current) {
          audioRef.current.src = ttsResult.media;
          audioRef.current.play().catch(e => {
            console.error("Audio play failed", e);
            toast({ variant: 'destructive', title: 'Audio Error', description: 'Could not play audio. Please ensure your device is not in silent mode.' });
          });
        }
        
        await updateCreditBalance(true);

    } catch (error: any) {
      if (error.message === 'SUBSCRIPTION_REQUIRED') {
        setSubscriptionModalOpen(true);
      } else if (error.message === 'INSUFFICIENT_CREDITS') {
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
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 500);
    }
  };


  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-100 to-blue-50 p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_20px_55px_8px_rgba(110,100,150,0.45)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="relative flex h-[130px] w-[130px] shrink-0 items-center justify-center">
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

        <div className="flex h-auto min-h-[4rem] w-full flex-col justify-center rounded-2xl border border-white/40 bg-white/80 p-3 text-left shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_10px_30px_3px_rgba(100,90,140,0.45)] backdrop-blur-sm backdrop-saturate-150">
           {isLoading ? (
              <div className="space-y-2 text-center">
                <Progress value={loadingProgress} className="w-full" />
                <p className="text-[13px] text-gray-600">Sally is thinking...</p>
              </div>
           ) : (
            <div className="flex-grow text-[13px] leading-tight text-black">
              <strong>Sally</strong>
              <span className="text-gray-600"> - {sallyResponse}</span>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

const ProfileView = () => {
  const { profile, isLoading, saveProfile } = useUserData();
  const [isSaving, setIsSaving] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    if (profile) {
      saveProfile({ ...profile, [id]: value }); 
    }
  };

  const handleSelectChange = (value: string) => {
    if (profile) {
      saveProfile({ ...profile, gender: value });
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date && profile) {
      saveProfile({ ...profile, birthDate: date });
    }
    setIsDatePickerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    // Validation check
    if (!profile.name || !profile.weight || !profile.goals || !profile.birthDate) {
        toast({
            variant: 'destructive',
            title: 'Incomplete Profile',
            description: 'Please fill out all fields before saving.',
        });
        return;
    }
    
    setIsSaving(true);
    await saveProfile(profile);
    toast({
        title: 'Profile Saved',
        description: 'Your profile has been updated.',
    });
    setIsSaving(false);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center bg-black pb-40 pt-5">
        <div className="w-[90%] max-w-[600px] rounded-lg bg-[rgba(14,1,15,0.32)] p-5">
          <div className="mb-8 flex justify-center">
            <Skeleton className="h-[140px] w-[140px] rounded-full" />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
            <div className="pt-4">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-black pb-40 pt-5">
      <div className="w-[90%] max-w-[600px] rounded-lg bg-[rgba(14,1,15,0.32)] p-5">
        <div className="mb-8 flex justify-center">
          <Image
            src="https://gallery.scaneats.app/images/Personal%20Pic.png"
            alt="Profile & Personal Goals"
            width={140}
            height={140}
            className="max-h-[140px] w-auto max-w-full"
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <Label
              htmlFor="name"
              className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]"
            >
              Name
            </Label>
            <Input
              id="name"
              value={profile.name}
              onChange={handleInputChange}
              placeholder="Your Name"
              className="w-full rounded-full border-2 border-[#555] bg-black px-4 py-3 text-base"
              required
            />
          </div>

          <div className="form-group">
            <Label
              htmlFor="gender"
              className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]"
            >
              Gender
            </Label>
            <Select value={profile.gender} onValueChange={handleSelectChange}>
              <SelectTrigger className="w-full rounded-full border-2 border-[#555] bg-black px-4 py-3 text-base">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-group">
            <Label
              htmlFor="weight"
              className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]"
            >
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              value={profile.weight}
              onChange={handleInputChange}
              placeholder="e.g., 70"
              className="w-full rounded-full border-2 border-[#555] bg-black px-4 py-3 text-base"
              required
            />
          </div>

          <div className="form-group">
            <Label
              htmlFor="birthDate"
              className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]"
            >
              Birth Date
            </Label>
            <Popover
              open={isDatePickerOpen}
              onOpenChange={setIsDatePickerOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start rounded-full border-2 border-[#555] bg-black px-4 py-3 text-left text-base font-normal hover:bg-black/80',
                    !profile.birthDate && 'text-gray-400'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {profile.birthDate ? (
                    format(new Date(profile.birthDate), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={profile.birthDate ? new Date(profile.birthDate) : undefined}
                  onSelect={handleDateChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date('1900-01-01')
                  }
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="form-group">
            <Label
              htmlFor="goals"
              className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]"
            >
              Body Goal
            </Label>
            <Textarea
              id="goals"
              value={profile.goals}
              onChange={handleInputChange}
              placeholder="e.g., Lose 5kg, build muscle, improve cardiovascular health..."
              className="min-h-[100px] w-full rounded-3xl border-2 border-[#555] bg-black px-4 py-3 text-base"
              required
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSaving || isLoading}
              className="w-full rounded-lg bg-[#7F00FF] py-3 text-lg font-bold text-white transition-all hover:bg-[#9300FF] hover:shadow-[0_0_12px_6px_rgba(127,0,255,0.8)] disabled:opacity-50"
              style={{
                boxShadow: '0 0 8px 2px rgba(127, 0, 255, 0.6)',
              }}
            >
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsItem = ({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div
      onClick={onClick}
      className={`flex items-center p-4 transition-colors rounded-lg ${
        href || onClick ? 'cursor-pointer hover:bg-zinc-800' : ''
      }`}
    >
      <Icon className="mr-4 h-5 w-5 text-gray-300" />
      <span className="flex-1 font-medium text-white">{label}</span>
      {(href || onClick) && <ChevronRight className="h-5 w-5 text-gray-500" />}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

const DestructiveSettingsItem = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="flex cursor-pointer items-center p-4 transition-colors rounded-lg hover:bg-red-900/50"
  >
    <Icon className="mr-4 h-5 w-5 text-red-400" />
    <span className="flex-1 font-medium text-red-400">{label}</span>
  </div>
);

const SettingsView = ({
  onNavigateToProfile,
}: {
  onNavigateToProfile: () => void;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, creditBalance, isLoading, setSubscriptionModalOpen, fetchProfile } =
    useUserData();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/login');
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');

    if (!token || !email) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You are not logged in.',
      });
      setIsCancelling(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription/cancel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription has been successfully cancelled.',
        });
        fetchProfile(); // Refresh user data
      } else {
        let errorMessage = 'Failed to cancel subscription.';
        if (response.status === 401) {
            errorMessage = 'Authentication error. Please log in again.';
        } else if (response.status === 400) {
          errorMessage = 'No active subscription found to cancel.';
        } else if (response.status >= 500) {
          errorMessage =
            'Our servers are experiencing issues. Please try again later.';
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description: error.message,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem('authToken');

    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You are not logged in.',
      });
      setIsDeleting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/delete-account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({error: 'An unknown error occurred.'}));
        throw new Error(errorData.error);
      }

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
      handleLogout();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
      });
      return;
    }
    setIsChangingPassword(true);

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not verify user information. Please log in again.',
      });
      setIsChangingPassword(false);
      return;
    }

    const payload = {
        currentPassword: currentPassword,
        newPassword: newPassword,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been updated successfully.',
        });
        setIsPasswordDialogOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        let errorMessage = 'Failed to change password.';
         try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Keep generic message
          }
        if (response.status === 401 || response.status === 403) {
           errorMessage = 'Authentication error. Please log in again.';
        } else if (response.status === 400) {
          errorMessage = 'The current password you entered is incorrect.';
        } else if (response.status >= 500) {
          errorMessage =
            'Our servers are experiencing issues. Please try again later.';
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 text-gray-200">
        <main className="w-full max-w-2xl flex-1 self-center p-6">
          <div className="space-y-8">
            <div className="space-y-4 rounded-lg bg-zinc-900 p-6">
              <Skeleton className="h-7 w-32 rounded-md" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
            <div className="space-y-4 rounded-lg bg-zinc-900 p-6">
              <Skeleton className="h-7 w-24 rounded-md" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
            <div className="space-y-4 rounded-lg bg-zinc-900 p-6">
              <Skeleton className="h-7 w-24 rounded-md" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isSubscribed = profile?.isSubscribed ?? false;

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-gray-200">
      <header className="sticky top-0 z-10 w-full bg-zinc-900/50 p-4 shadow-md backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-center">
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>
      <main className="w-full max-w-2xl mx-auto p-6 pb-28">
        <div className="space-y-8">
          <div className="space-y-4 rounded-lg bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Account</h2>
            <SettingsItem
              icon={UserCircle}
              label="Profile & Personal Goals"
              onClick={onNavigateToProfile}
            />
            <Dialog
              open={isPasswordDialogOpen}
              onOpenChange={setIsPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <button className="w-full">
                  <SettingsItem icon={Lock} label="Change Password" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-4 py-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </form>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4 rounded-lg bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Billing</h2>
            <div className="flex items-center p-4">
              <Wallet className="mr-4 h-5 w-5 text-gray-300" />
              <span className="flex-1 font-medium text-white">My Wallet</span>
              <span className="font-semibold text-white">
                {creditBalance !== null ? (
                  `${creditBalance} Credits`
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </span>
            </div>
            {isSubscribed ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <button className="w-full">
                        <DestructiveSettingsItem
                          icon={XCircle}
                          label="Cancel Subscription"
                          onClick={() => {}}
                        />
                      </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will cancel your subscription at the end of the current billing period. You will lose access to premium features, but your data will be saved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        className={buttonVariants({ variant: 'destructive' })}
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                      >
                        {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            ) : (
                <SettingsItem
                  icon={Repeat}
                  label="Manage Subscription"
                  href="/pricing"
                />
            )}
            <SettingsItem
              icon={CreditCard}
              label="Buy Credits"
              href="/credits"
            />
          </div>

          <div className="space-y-4 rounded-lg bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">Actions</h2>
            <SettingsItem icon={LogOut} label="Log Out" onClick={handleLogout} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full">
                  <DestructiveSettingsItem
                    icon={Trash2}
                    label="Delete Account"
                    onClick={() => {}}
                  />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: 'destructive' })}
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}{' '}
                    Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </main>
    </div>
  );
};


export default function DashboardPage() {
  const [activeView, setActiveView] = useState<View>('home');

  const handleNavigate = (view: View) => {
    setActiveView(view);
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView onNavigate={handleNavigate} />;
      case 'scan':
        return <ScanView onNavigate={handleNavigate} />;
      case 'meal-plan':
        return <MealPlanView onNavigate={handleNavigate}/>;
      case 'sally':
        return <SallyView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return (
          <SettingsView onNavigateToProfile={() => setActiveView('profile')} />
        );
      default:
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative h-screen">
      {renderView()}
      <BottomNav activeView={activeView} onNavigate={handleNavigate} />
    </div>
  );
}
