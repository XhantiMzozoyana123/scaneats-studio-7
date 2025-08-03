
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BackgroundImage } from '@/components/background-image';
import { API_BASE_URL } from '@/lib/api';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState({ title: '', description: '' });

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setStatus('error');
      setMessage({
        title: 'Verification Error',
        description: 'Payment reference not found. Your transaction could not be verified.'
      });
      return;
    }

    const verifyPayment = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'You are not logged in. Please log in and try again.',
        });
        router.push('/login');
        return;
      }

      const verificationUrl = `${API_BASE_URL}/api/event/last/${encodeURIComponent(reference)}`;

      try {
        const response = await fetch(verificationUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          const isSuccess = data.title && data.title.toLowerCase().includes('successful');

          if (isSuccess) {
            setStatus('success');
            setMessage({
                title: data.title,
                description: data.message,
            });
            
            // The C# controller has a typo in the property name. It is UserAccesToken not UserAccessToken
            if (data.userAccesToken) {
              localStorage.setItem('authToken', data.userAccesToken);
            }

            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
          } else {
             setStatus('error');
             setMessage({
                title: data.title || 'Verification Failed',
                description: data.message || 'The transaction could not be verified or was not successful.',
             });
          }

        } else {
            let errorMsg = 'Failed to verify your payment.';
             if (response.status === 401) {
                errorMsg = 'Your session has expired. Please log in again.';
            } else if (response.status === 404) {
                errorMsg = 'Could not find the payment to verify. Please contact support.';
            } else if (response.status >= 500) {
                errorMsg = 'Our servers are experiencing issues. Please try again later.';
            } else {
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                    errorMsg = errorData.message;
                    }
                } catch {
                    // keep generic message
                }
            }
            throw new Error(errorMsg);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage({ title: 'Verification Failed', description: error.message || 'An unexpected error occurred during verification.' });
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: error.message,
        });
      }
    };

    verifyPayment();
  }, [searchParams, router, toast]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h1 className="text-2xl font-semibold">Verifying Your Payment...</h1>
            <p className="text-gray-300">Please wait while we confirm your transaction.</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center gap-4 text-center text-white">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-semibold">{message.title}</h1>
            <p className="text-gray-300">{message.description}</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center gap-4 text-center text-white">
            <XCircle className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-semibold">{message.title}</h1>
            <p className="max-w-md text-gray-300">{message.description}</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-5">
       <BackgroundImage
        src="https://placehold.co/1200x800.png"
        data-ai-hint="abstract purple"
        className="blur-md"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/15 bg-black/60 p-8 text-center shadow-2xl backdrop-blur-lg">
        {renderContent()}
      </div>
    </div>
  );
}


export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    )
}
