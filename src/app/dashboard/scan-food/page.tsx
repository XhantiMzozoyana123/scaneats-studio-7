
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { BackgroundImage } from '@/components/background-image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserDataProvider, useUserData } from '@/context/user-data-context';
import { foodScanNutrition } from '@/ai/flows/food-scan-nutrition';
import { API_BASE_URL } from '@/lib/api';

function ScanFoodContent() {
  const { toast } = useToast();
  const router = useRouter();
  const { setSubscriptionModalOpen, updateCreditBalance } = useUserData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const getCameraPermission = async () => {
      setIsLoading(true);
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
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
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
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

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

  const handleRetake = () => {
    setCapturedImage(null);
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
        const subResponse = await fetch(`${API_BASE_URL}/api/event/subscription/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

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

        const creditsResponse = await fetch(`${API_BASE_URL}/api/event/credits/remaining`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!creditsResponse.ok) throw new Error('Failed to check credits.');
        const creditsData = await creditsResponse.json();
        if (creditsData.remainingCredits <= 0) {
            toast({
                variant: 'destructive',
                title: 'No Credits Left',
                description: 'Please purchase more credits to continue using this feature.'
            });
            return;
        }
        
        const responseData = await foodScanNutrition({ photoDataUri: capturedImage });
        
        localStorage.setItem('scannedFood', JSON.stringify(responseData));
        
        const deductResponse = await fetch(`${API_BASE_URL}/api/event/deduct-credits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(1)
        });
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
  
  const handleCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  };

  const renderContent = () => {
    if (isLoading || hasCameraPermission === null) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-white">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p>Accessing Camera...</p>
        </div>
      );
    }

    if (!hasCameraPermission) {
      return (
        <div className="flex h-full items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
                This feature requires camera access. Please grant permission in your
                browser settings and refresh the page.
            </AlertDescription>
            </Alert>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <div className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl mb-4 border-2 border-primary/50">
          {capturedImage ? (
            <Image
              src={capturedImage}
              alt="Captured food"
              layout="responsive"
              width={1920}
              height={1080}
              className="object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full"
              autoPlay
              muted
              playsInline
              onCanPlay={handleCanPlay}
            />
          )}
        </div>

        <div className="flex justify-center gap-4 w-full max-w-2xl">
          {capturedImage ? (
            <>
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
            </>
          ) : (
            <Button
              onClick={handleCapture}
              className="h-20 w-20 rounded-full border-4 border-white/50 bg-primary/80 text-white shadow-2xl animate-breathe-glow"
            >
              <Camera className="h-8 w-8" />
              <span className="sr-only">Capture</span>
            </Button>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
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
