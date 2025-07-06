'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGoogleOneTapLogin,
  GoogleLogin,
  type CredentialResponse,
} from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BackgroundImage } from '@/components/background-image';
import { KeyRound, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL, googleLogin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (!credentialResponse.credential) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Could not retrieve Google credentials.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userEmail', data.userEmail);

      toast({
        title: 'Login Successful!',
        description: 'Welcome back.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: 'destructive',
      title: 'Login Failed',
      description: 'Google authentication failed. Please try again.',
    });
  };

  useGoogleOneTapLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', email);

        toast({
          title: 'Login Successful!',
          description: 'Welcome back.',
        });
        router.push('/dashboard');
      } else {
        let errorMessage = 'An unknown error occurred during login.';
        if (response.status === 401) {
          errorMessage = 'Incorrect email or password. Please try again.';
        } else if (response.status >= 500) {
          errorMessage =
            'Our servers are currently unavailable. Please try again later.';
        } else {
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Keep the generic message
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const isValidToken = token !== null;

    if (isValidToken) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <BackgroundImage
        src="https://placehold.co/1200x800.png"
        data-ai-hint="abstract purple"
        className="blur-md"
      />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-3xl bg-black/60 p-8 backdrop-blur-lg">
        <div className="mb-8 text-left">
          <h2 className="font-headline text-4xl font-bold leading-tight">
            Log into <br />
            your account
          </h2>
        </div>

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

          <div className="relative border-b border-white/40">
            <KeyRound className="absolute left-0 top-3 h-5 w-5 text-white/70" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-0 bg-transparent pl-8 text-base placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Link
              href="/forgot-password"
              className="absolute right-0 top-3 text-sm text-white/70 transition-colors hover:text-white"
            >
              Forgot?
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <Label htmlFor="remember-me" className="text-white/70">
                Remember me
              </Label>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-stone-900 py-6 text-base font-semibold hover:bg-stone-800"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Log In'}
            </Button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/40" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black/60 px-2 text-white/70">
              Or log in with Google
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            shape="rectangular"
            size="large"
          />
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          Don't have an account?{' '}
          <Link href="/" className="font-semibold text-white hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
