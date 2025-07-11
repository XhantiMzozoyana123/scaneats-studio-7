
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BackgroundImage } from '@/components/background-image';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(email),
      });

      if (response.ok) {
        toast({
          title: 'Check your email',
          description: 'If an account with that email exists, we have sent a password reset link.',
        });
        setIsSent(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset link.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <BackgroundImage src="https://gallery.scaneats.app/images/Landing%20page%20LP.gif" unoptimized={true} className="blur-md" />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-3xl bg-black/60 p-8 backdrop-blur-lg">
        <div className="mb-8 text-left">
          <h2 className="font-headline text-4xl font-bold leading-tight">
            Forgot Password
          </h2>
          <p className="mt-2 text-white/70">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {isSent ? (
            <div className="text-center">
                 <p className="text-white">An email has been sent with instructions to reset your password. Please check your inbox.</p>
                 <Button asChild className="mt-6 w-full rounded-full bg-stone-900 py-6 text-base font-semibold hover:bg-stone-800">
                     <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Link>
                </Button>
            </div>
        ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative border-b border-white/40">
                <Mail className="absolute left-0 top-3 h-5 w-5 text-white/70" />
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-0 bg-transparent pl-8 text-base placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                </div>
                
                <div className="pt-4">
                <Button type="submit" disabled={isLoading} className="w-full rounded-full bg-stone-900 py-6 text-base font-semibold hover:bg-stone-800">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
                </Button>
                </div>
            </form>
        )}

        <p className="mt-8 text-center text-sm text-white/70">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
