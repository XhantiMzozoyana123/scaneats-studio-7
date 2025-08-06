
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
  CircleDollarSign,
  Calendar as CalendarIcon,
  XCircle,
  Upload,
  Smartphone,
  Info,
  Sparkles,
} from 'lucide-react';

import { useToast } from '@/app/shared/hooks/use-toast';
import { useUserData } from '@/app/shared/context/user-data-context';
import { cn } from '@/app/shared/lib/utils';
import { BottomNav } from '@/app/shared/components/bottom-nav';
import { API_BASE_URL } from '@/app/shared/lib/api';
import { useIsMobile } from '@/app/shared/hooks/use-mobile';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { MealService } from '@/app/features/meal-plan/application/meal.service';
import { MealApiRepository } from '@/app/features/meal-plan/data/meal-api.repository';
import type { ScannedFood } from '@/app/domain/scanned-food';

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
  const { profile, setSubscriptionModalOpen } = useUserData();
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

    if (!profile || profile.id === null) {
        toast({
            variant: 'destructive',
            title: 'Profile Not Loaded',
            description: 'Please wait for your profile to load before scanning.',
        });
        return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            Base64: capturedImage,
            Logging: {
                ProfileId: profile.id,
            }
          })
      });

      if (response.status === 401) {
        router.push('/login');
        throw new Error('Session Expired. Please log in again.');
      }
      
      if (response.status === 403) {
        setSubscriptionModalOpen(true);
        throw new Error('Subscription required');
      }
      
      if (response.status === 429) {
        toast({
            variant: 'destructive',
            title: 'Out of Credits',
            description: 'You have used all your credits. Please buy more to continue scanning.',
            action: (
              <Button onClick={() => router.push('/credits')} className="gap-2">
                <CircleDollarSign />
                Buy Credits
              </Button>
            )
        });
        throw new Error('Out of credits');
      }
      
      if (!response.ok) {
        let errorMsg = "Scan failed";
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      
      const scanResult = await response.json();
      
      toast({
          title: 'Success!',
          description: `Identified: ${scanResult.name}.`,
      });
      onNavigate('meal-plan');

    } catch (error: any) {
      if (
        error.message !== 'Subscription required' && 
        error.message !== 'Out of credits' &&
        !error.message.includes('Session Expired')
      ) {
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
                          <Alert variant="destructive" className="bg-destructive/20 border-destructive/50 text-destructive-foreground">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <AlertTitle>Camera Unavailable</AlertTitle>
                              <AlertDescription>
                                 {cameraState === 'denied'
                                   ? 'Permission was denied. Please allow camera access in your browser settings.'
                                   : 'Could not access the camera. You can try again or upload a photo.'}
                              </AlertDescription>
                          </Alert>
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
              isMobile && (
              <div className="flex w-full items-center gap-2">
                 <Button onClick={handleCapture} disabled={cameraState !== 'running'} className="h-16 flex-1 rounded-full text-lg bg-primary animate-breathe-glow">
                   <Camera className="mr-2" /> Capture
                 </Button>
                  <Button onClick={() => fileInputRef.current?.click()} size="icon" variant="secondary" className="h-16 w-16 rounded-full">
                     <Upload />
                     <span className="sr-only">Upload Photo</span>
                  </Button>
              </div>
              )
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


const mealRepository = new MealApiRepository();
const mealService = new MealService(mealRepository);

const MealPlanView = () => {
  const { toast } = useToast();
  const { profile, setSubscriptionModalOpen } = useUserData();
  const [scannedFood, setScannedFood] = useState<ScannedFood | null>(null);
  const [isMealLoading, setIsMealLoading] = useState(true);
  const [sallyResponse, setSallyResponse] = useState<string | null>(null);
  const [isSallyLoading, setIsSallyLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();


  useEffect(() => {
    const fetchMealPlan = async () => {
      setIsMealLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Not Authenticated',
          description: 'Please log in to view your meal plan.',
        });
        setIsMealLoading(false);
        return;
      }

      try {
        const meal = await mealService.getLastMealPlan(token);
        setScannedFood(meal);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to load meal plan',
          description: error.message,
        });
      } finally {
        setIsMealLoading(false);
      }
    };

    fetchMealPlan();
  }, [toast]);


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

  const handleMicClick = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    try {
      if (isSallyLoading) return;
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
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
    
    if (!profile?.name) {
       toast({
          variant: 'destructive',
          title: 'Profile Incomplete',
          description: 'Please complete your profile before talking to Sally.',
       });
       return;
    }

    setIsSallyLoading(true);
    setSallyResponse(`Thinking about: "${userInput}"`);

    try {
        const response = await fetch(`${API_BASE_URL}/api/sally/meal-planner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ClientName: profile.name,
            ClientDialogue: userInput,
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
        
        if (response.status === 429) {
          toast({
              variant: 'destructive',
              title: 'Out of Credits',
              description: 'You have used all your credits. Please buy more to continue scanning.',
              action: (
                <Button onClick={() => router.push('/credits')} className="gap-2">
                  <CircleDollarSign />
                  Buy Credits
                </Button>
              )
          });
          throw new Error('Out of credits');
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
        
        const { media: audioDataUri } = await textToSpeech(result.agentDialogue);
        if (audioDataUri && audioRef.current) {
            audioRef.current.src = audioDataUri;
            audioRef.current.play();
        }

    } catch (error: any) {
      if (error.message !== 'Subscription required' && error.message !== 'Unauthorized' && error.message !== 'Out of credits') {
        setSallyResponse('Sorry, I had trouble with that. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'An error occurred while talking to Sally.',
        });
      }
    } finally {
      setIsSallyLoading(false);
    }
  };
  
  const { totalCalories, totalProtein, totalCarbs, totalFat } = useMemo(() => {
    if (!scannedFood) {
      return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
    }
    return {
      totalCalories: scannedFood.total || 0,
      totalProtein: scannedFood.protein || 0,
      totalCarbs: scannedFood.carbs || 0,
      totalFat: scannedFood.fat || 0,
    };
  }, [scannedFood]);


  if (isMealLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p>Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  if (!scannedFood) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <Info className="h-12 w-12 text-primary" />
          <h2 className="text-xl font-bold">No food scanned yet.</h2>
          <p className="text-muted-foreground">Scan an item to get started!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative h-full w-full flex-grow">
      <video
        src="https://gallery.scaneats.app/images/MealPlannerPage.webm"
        className="fixed inset-0 -z-10 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="fixed inset-0 -z-10 bg-black/60" />
      
      <div className="flex h-full w-full flex-col items-center p-5 pb-[155px] box-border overflow-y-auto">
        <header className="flex justify-between items-center mb-5 w-full max-w-[600px] px-[15px] box-sizing-border shrink-0">
          <div className="w-[150px] h-[75px] text-left">
            <Image
              src="https://gallery.scaneats.app/images/ScanEatsLogo.png"
              alt="ScanEats Logo"
              width={150}
              height={75}
              className="max-w-full max-h-full block object-contain"
            />
          </div>
        </header>
        
        <div className="flex flex-col items-center mb-[25px] shrink-0 text-center">
          <div className="text-3xl md:text-4xl font-medium mb-2 text-white text-shadow-[0_0_10px_white]">
              {totalCalories.toFixed(0)}
          </div>
          <div className="text-sm md:text-base text-white bg-[rgba(34,34,34,0.7)] px-3 py-1.5 rounded-full tracking-wider">
              Total Calories
          </div>
        </div>

        <div className="flex justify-around items-stretch mb-[25px] w-full max-w-[550px] gap-[15px] flex-wrap shrink-0">
          <div className="bg-primary/80 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out text-white flex-1 min-w-[90px] shadow-[0_0_10px_rgba(106,27,154,0.5)] border border-[rgba(255,255,255,0.1)] hover:-translate-y-1">
            <div className="text-lg mb-2 font-normal text-shadow-[0_0_10px_white]">Protein</div>
            <div className="text-2xl font-semibold text-shadow-[0_0_10px_white]">{totalProtein.toFixed(0)}g</div>
          </div>
          <div className="bg-primary/80 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out text-white flex-1 min-w-[90px] shadow-[0_0_10px_rgba(106,27,154,0.5)] border border-[rgba(255,255,255,0.1)] hover:-translate-y-1">
            <div className="text-lg mb-2 font-normal text-shadow-[0_0_10px_white]">Fat</div>
            <div className="text-2xl font-semibold text-shadow-[0_0_10px_white]">{totalFat.toFixed(0)}g</div>
          </div>
          <div className="bg-primary/80 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out text-white flex-1 min-w-[90px] shadow-[0_0_10px_rgba(106,27,154,0.5)] border border-[rgba(255,255,255,0.1)] hover:-translate-y-1">
            <div className="text-lg mb-2 font-normal text-shadow-[0_0_10px_white]">Carbs</div>
            <div className="text-2xl font-semibold text-shadow-[0_0_10px_white]">{totalCarbs.toFixed(0)}g</div>
          </div>
        </div>

        <button onClick={handleMicClick} className="flex flex-col justify-center items-center bg-gradient-to-r from-[#4a148c] to-[#311b92] text-white rounded-full w-[120px] h-[120px] my-10 mx-auto text-base tracking-wider cursor-pointer border-2 border-[rgba(255,255,255,0.2)] transition-transform duration-200 ease-in-out animate-breathe-glow shrink-0">
           <Mic className="h-16 w-16" style={{textShadow: '0 0 8px rgba(255, 255, 255, 0.8)'}} />
        </button>
        
        <div className="text-center mt-4 mb-8 text-white text-shadow-[0_0_6px_rgba(255,255,255,0.8),_0_0_3px_rgba(255,255,255,0.6)] text-lg font-normal bg-transparent px-5 py-3 rounded-2xl inline-block max-w-[85%] shadow-[0_0_15px_rgba(0,0,0,0.4),_0_0_5px_rgba(0,0,0,0.3)] border-l-4 border-[#a033ff] shrink-0">
           {isSallyLoading ? 'Sally is thinking...' : (sallyResponse || "Ask me about this meal and I'll tell you everything")}
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

const SallyView = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
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
  const { profile, setSubscriptionModalOpen } = useUserData();
  
  useEffect(() => {
    audioRef.current = new Audio();
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

  const handleMicClick = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      if (isLoading) return; // Prevent starting new recording while processing
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      recognitionRef.current?.start();
    } catch (error) {
      console.error('Microphone permission error:', error);
 toast({ variant: 'destructive', title: 'Microphone Access Denied', description: 'Please allow microphone access in your browser settings to use this feature.', });
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

    if (!profile?.name) {
      toast({ 
          variant: 'destructive',
          title: 'Profile Incomplete',
          description: 'Please set your name in the profile before talking to Sally.'
       });
       onNavigate('profile');
      return;
    }

    setIsLoading(true);
    setLoadingProgress(10);
    setSallyResponse(`Thinking about: "${userInput}"`);

    try {
        const response = await fetch(`${API_BASE_URL}/api/sally/body-assessment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ClientName: profile.name,
            ClientDialogue: userInput,
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
        
        const { media: audioDataUri } = await textToSpeech(result.agentDialogue);
        if (audioDataUri && audioRef.current) {
            audioRef.current.src = audioDataUri;
            audioRef.current.play();
        }

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
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 500);
    }
  };


  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-100 to-blue-50 p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl p-6 shadow-[0_20px_55px_8px_rgba(110,100,150,0.45)] backdrop-blur-2xl backdrop-saturate-150"
          style={{
             background: 'hsla(0,0%,100%,.7)',
          }}
      >
        <div className="relative flex h-[130px] w-[130px] shrink-0 items-center justify-center">
          <div
            className="absolute top-1/2 left-1/2 h-[160%] w-[160%] -translate-x-1/2 -translate-y-1/2 animate-breathe-glow-sally rounded-full"
            style={{
              background:
                'radial-gradient(circle at center, hsla(var(--primary), 0.05) 10%, hsla(var(--primary), 0.1) 40%, hsla(var(--primary), 0.15) 65%, hsla(var(--primary), 0.1) 72%, hsla(var(--primary), 0) 80%)',
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

        <div className="flex h-auto min-h-[4rem] w-full flex-col justify-center rounded-2xl p-3 text-left shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_10px_30px_3px_rgba(100,90,140,0.45)] backdrop-blur-sm backdrop-saturate-150">
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
  const { profile, initialProfile, setProfile, isLoading, saveProfile } = useUserData();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const isDirty = useMemo(() => {
    if (!profile || !initialProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
  }, [profile, initialProfile]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    if (!profile) return;
    setProfile({ ...profile, gender: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date && profile) {
      setProfile({ ...profile, birthDate: date });
    }
    setIsDatePickerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    const success = await saveProfile(profile);
    if (success) {
      toast({
        title: 'Profile Saved!',
        description: 'Your profile has been updated.',
      });
    }
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
      <div className="w-[90%] max-w-[600px] rounded-lg bg-[rgba(14,1_5,0.32)] p-5">
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
              disabled={isSaving || isLoading || !isDirty}
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
  value,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number;
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
       {value !== undefined && (
        <span className="text-gray-400 mr-2 font-medium">{value}</span>
      )}
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
  const { profile, isLoading, fetchProfile } =
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

    if (!token) {
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
      });

      if (response.ok) {
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription has been successfully cancelled.',
        });
        await fetchProfile(); // Refresh user data
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

      if (response.ok) {
        toast({
          title: 'Account Deleted',
          description: 'Your account has been permanently deleted.',
        });
        handleLogout();
      } else {
        let errorMessage = 'Failed to delete account.';
        if (response.status === 401 || response.status === 403) {
           errorMessage = 'Authentication error. Please log in again.';
        } else if (response.status >= 500) {
          errorMessage =
            'Our servers are experiencing issues. Please try again later.';
        }
        throw new Error(errorMessage);
      }
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
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (response.status === 400) {
          errorMessage = 'The current password you entered is incorrect.';
        } else if (response.status >= 500) {
          errorMessage =
            'Our servers are experiencing issues. Please try again later.';
        } else {
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Keep generic message
          }
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
                  <SettingsItem icon={Lock} label="Change Password" onClick={() => {}}/>
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
             <SettingsItem
              icon={Wallet}
              label="Your Credits"
              value={profile?.credits ?? 0}
            />
             <SettingsItem
              icon={CircleDollarSign}
              label="Buy Credits"
              href="/credits"
            />
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
        return <MealPlanView />;
      case 'sally':
        return <SallyView onNavigate={handleNavigate} />;
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
