
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { BackgroundImage } from '@/components/background-image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  Camera,
  RefreshCw,
  Send,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { useUserData } from '@/context/user-data-context';
import { foodScanNutrition } from '@/ai/flows/food-scan-nutrition';
import { API_BASE_URL } from '@/lib/api';

function ScanFoodContent() {
  const { toast } = useToast();
  const router = useRouter();
  const { setSubscriptionModalOpen, updateCreditBalance } = useUserData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setIsLoading(true);
    setHasCameraPermission(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
      setHasCameraPermission(false);
      setIsLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCameraPermission(true);
      setIsCameraStarted(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description:
          'Please enable camera permissions in your browser settings.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

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
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setCapturedImage(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSendScan = async () => {
    if (!capturedImage) return;

    setIsSending(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ variant: 'destructive', title: 'Authentication Error' });
      setIsSending(false);
      return;
    }

    try {
      const subResponse = await fetch(
        `${API_BASE_URL}/api/event/subscription/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!subResponse.ok) {
        if (subResponse.status === 401 || subResponse.status === 403) {
          setSubscriptionModalOpen(true);
          return;
        }
        throw new Error('Failed to check subscription status.');
      }
      const subData = await subResponse.json();
      if (!subData.isSubscribed) {
        setSubscriptionModalOpen(true);
        return;
      }

      const creditsResponse = await fetch(
        `${API_BASE_URL}/api/event/credits/remaining`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!creditsResponse.ok) throw new Error('Failed to check credits.');
      const creditsData = await creditsResponse.json();
      if (creditsData.remainingCredits <= 0) {
        toast({
          variant: 'destructive',
          title: 'No Credits Left',
          description:
            'Please purchase more credits to continue using this feature.',
        });
        return;
      }

      const responseData = await foodScanNutrition({
        photoDataUri: capturedImage,
      });

      localStorage.setItem('scannedFood', JSON.stringify(responseData));

      const deductResponse = await fetch(
        `${API_BASE_URL}/api/event/deduct-credits`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(1),
        }
      );
      if (!deductResponse.ok) throw new Error('Failed to deduct credit.');
      updateCreditBalance(true);

      toast({
        title: 'Success!',
        description: `Identified: ${responseData.name}.`,
      });

      router.push('/dashboard');
      handleRetake();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderContent = () => {
    if (capturedImage) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
          <div className="w-full max-w-sm aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-2xl mb-4 border-2 border-primary/50">
            <Image
              src={capturedImage}
              alt="Captured food"
              layout="fill"
              objectFit="contain"
              className="object-contain"
            />
          </div>
          <div className="flex justify-center gap-4 w-full max-w-2xl">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="text-lg py-6 flex-1 max-w-xs bg-white/20 text-white border-white/50 backdrop-blur-sm hover:bg-white/30"
            >
              <RefreshCw className="mr-2" /> Retake
            </Button>
            <Button
              onClick={handleSendScan}
              disabled={isSending}
              className="text-lg py-6 flex-1 max-w-xs bg-primary"
            >
              {isSending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Send className="mr-2" /> Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }

    if (isCameraStarted) {
      if (isLoading) {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-white">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p>Starting Camera...</p>
          </div>
        );
      }

      if (hasCameraPermission === false) {
        return (
          <div className="flex h-full items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                This feature requires camera access. Please grant permission
                and try again.
              </AlertDescription>
              <Button onClick={() => setIsCameraStarted(false)} className="mt-4">
                Go Back
              </Button>
            </Alert>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
          <div className="w-full max-w-sm aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-2xl mb-4 border-2 border-primary/50">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
          </div>
          <div className="flex justify-center gap-4 w-full max-w-2xl">
            <Button
              onClick={handleCapture}
              className="h-20 w-20 rounded-full border-4 border-white/50 bg-primary/80 text-white shadow-2xl animate-breathe-glow"
            >
              <Camera className="h-8 w-8" />
              <span className="sr-only">Capture</span>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 gap-6 text-white">
        <h1 className="text-3xl font-bold text-center">Scan Your Food</h1>
        <p className="text-center max-w-sm">
          Use your camera to scan a food item, or upload an image from your device.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button
            onClick={startCamera}
            disabled={isLoading}
            className="text-lg py-8 bg-primary"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Camera className="mr-2" /> Start Camera
              </>
            )}
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="text-lg py-8 bg-white/20 border-white/50 backdrop-blur-sm hover:bg-white/30"
          >
            <Upload className="mr-2" /> Upload Image
          </Button>
        </div>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
        />
      </div>
    );
  };

  return (
    <div className="h-screen w-screen relative">
      <BackgroundImage
        src="https://gallery.scaneats.app/images/Home%20Page%20Lp.gif"
        alt="Scanning background"
        className="z-0"
        unoptimized
      />
      <div className="relative z-10 h-full w-full bg-black/50">
        {renderContent()}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default function ScanFoodPage() {
  return (
    <UserDataProvider>
      <ScanFoodContent />
    </UserDataProvider>
  );
}
