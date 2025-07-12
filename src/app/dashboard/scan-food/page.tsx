
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
import { API_BASE_URL } from '@/lib/api';
import { UserDataProvider, useUserData } from '@/context/user-data-context';

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
          video: { facingMode: 'environment' },
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

    // Cleanup function to stop video tracks when component unmounts
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

    // Set canvas dimensions to match video stream
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
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to perform a scan.',
      });
      setIsSending(false);
      return;
    }

    // Extract raw base64 string
    const base64Image = capturedImage.split(',')[1];

    const promptDto = {
      Base64: base64Image,
      Logging: {
        ChatId: 0,
        ScanId: 0,
        ProfileId: 0,
        FoodId: 0,
      },
    };

    try {
      localStorage.removeItem('scannedFood');
      const response = await fetch(`${API_BASE_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(promptDto),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Your scan was submitted successfully.',
        });
        
        await updateCreditBalance(true);
        const responseData = await response.json();
        localStorage.setItem('scannedFood', JSON.stringify(responseData));
        router.push('/dashboard/meal-plan');
        handleRetake();
      } else {
        if (response.status === 401 || response.status === 403) {
          setSubscriptionModalOpen(true);
          return;
        }

        let errorMessage;
        if (response.status === 429) {
          errorMessage =
            'You have run out of credits. Please purchase more to continue scanning.';
        } else {
          try {
            const errorText = await response.text();
            errorMessage =
              errorText ||
              'Our servers are having some trouble. Please try again later.';
          } catch {
            errorMessage =
              'Our servers are having some trouble. Please try again later.';
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderContent = () => {
    if (isLoading || hasCameraPermission === null) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-white">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p>Accessing Camera...</p>
        </div>
      );
    }

    if (!hasCameraPermission) {
      return (
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            This feature requires camera access. Please grant permission in your
            browser settings and refresh the page.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="w-full max-w-lg space-y-4">
        <div className="relative w-full overflow-hidden rounded-lg border-4 border-primary/50 shadow-lg aspect-video bg-black">
          {capturedImage ? (
            <Image
              src={capturedImage}
              alt="Captured food"
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              muted
              playsInline
            />
          )}
        </div>

        <div className="flex justify-center gap-4">
          {capturedImage ? (
            <>
              <Button
                onClick={handleRetake}
                variant="outline"
                className="text-lg py-6 flex-1"
              >
                <RefreshCw className="mr-2" /> Retake
              </Button>
              <Button
                onClick={handleSendScan}
                disabled={isSending}
                className="text-lg py-6 flex-1 bg-primary"
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
              className="w-48 h-16 rounded-full text-lg bg-primary animate-breathe-glow"
            >
              <Camera className="mr-2" /> Capture
            </Button>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  };

  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="abstract technology"
        className="blur-md"
      />
      <main className="container z-10 mx-auto flex h-full flex-col items-center justify-center overflow-y-auto p-4 pb-28">
        {renderContent()}
      </main>
    </>
  );
}

export default function ScanFoodPage() {
  // This page needs access to the UserData context, so we wrap it
  return (
    <UserDataProvider>
      <ScanFoodContent />
    </UserDataProvider>
  );
}
