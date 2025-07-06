
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BackgroundImage } from '@/components/background-image';
import { API_BASE_URL } from '@/lib/api';

function SSOCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`SSO failed: ${errorParam}. Please try logging in again.`);
      return;
    }

    if (!code) {
      setError('SSO callback is missing required parameters. Please try logging in again.');
      return;
    }

    const handleCallback = async () => {
      try {
        const redirectUri = `${window.location.origin}/sso-callback`;
        const response = await fetch(`${API_BASE_URL}/api/Auth/google-callback?code=${encodeURIComponent(code)}&redirectUri=${encodeURIComponent(redirectUri)}`);

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('userEmail', data.email);

          toast({
            title: 'Login Successful!',
            description: 'Welcome to ScanEats.',
          });
          router.push('/dashboard');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to complete Google login.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during Google login.');
        toast({
          variant: 'destructive',
          title: 'SSO Login Failed',
          description: err.message,
        });
      }
    };

    handleCallback();
  }, [router, searchParams, toast]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 text-center text-white">
        <XCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-semibold">SSO Login Failed</h1>
        <p className="max-w-md text-gray-300">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/login">Return to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h1 className="text-2xl font-semibold">Completing Sign-In...</h1>
      <p className="text-gray-300">Please wait while we securely log you in.</p>
    </div>
  );
}

function SSOCallbackPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-5">
            <BackgroundImage src="https://placehold.co/1200x800.png" data-ai-hint="abstract purple" className="blur-md" />
            <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/15 bg-black/60 p-8 text-center shadow-2xl backdrop-blur-lg">
                <SSOCallbackContent />
            </div>
        </div>
    )
}

export default function SuspendedSSOCallbackPage() {
    return (
        <Suspense fallback={
            <div className="relative flex min-h-screen flex-col items-center justify-center p-5">
                 <BackgroundImage src="https://placehold.co/1200x800.png" data-ai-hint="abstract purple" className="blur-md" />
                 <div className="relative z-10 flex w-full max-w-lg items-center justify-center rounded-2xl border border-white/15 bg-black/60 p-8 text-center shadow-2xl backdrop-blur-lg">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                 </div>
            </div>
        }>
            <SSOCallbackPage />
        </Suspense>
    )
}
