
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthBackgroundImage } from '@/app/shared/components/auth-background-image';
import { KeyRound, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/app/shared/hooks/use-toast';
import { API_BASE_URL } from '@/app/shared/lib/api';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  nameid: string;
  email: string;
}

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.35 15.62C19.34 15.62 19.34 15.62 19.35 15.62C19.35 15.62 19.34 15.62 19.34 15.62C18.17 14.93 17.38 13.78 17.38 12.48C17.38 11.14 18.23 9.94 19.46 9.25C19.46 9.25 19.46 9.25 19.46 9.25C19.46 9.25 19.46 9.25 19.46 9.25C18.66 8.08 17.65 7.18 16.4 6.71C15.06 6.2 13.73 6.87 13.03 6.87C12.33 6.87 10.96 6.18 9.59 6.77C8.36 7.3 7.39 8.23 6.73 9.49C5.35 12.09 6.06 15.63 7.42 17.63C8.08 18.62 8.9 19.64 9.97 19.64C10.99 19.64 11.3 19.03 12.93 19.03C14.55 19.03 14.87 19.64 15.94 19.62C17.02 19.61 17.75 18.67 18.4 17.67C18.82 17.02 19.14 16.32 19.35 15.62M14.59 4.98C14.95 4.54 15.26 4.07 15.48 3.58C14.73 3.69 13.92 4.04 13.33 4.53C12.98 4.82 12.63 5.16 12.39 5.54C13.1 5.48 13.91 5.2 14.59 4.98Z" />
    </svg>
)

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          Email: email,
          Password: password,
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
          errorMessage = 'Our servers are currently unavailable. Please try again later.';
        } else {
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                  errorMessage = errorData.error;
                }
            } catch {
                // If parsing fails, stick with the generic status-based message.
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

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/googleauth/onetap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ IdToken: credentialResponse.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        
        const decodedToken: DecodedToken = jwtDecode(data.token);
        localStorage.setItem('userId', decodedToken.nameid);
        localStorage.setItem('userEmail', decodedToken.email);
        
        toast({
          title: 'Login Successful!',
          description: 'Welcome to ScanEats.',
        });
        router.push('/dashboard');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Google login failed.'}));
        throw new Error(errorData.error || 'Google One Tap login failed.');
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

  const handleAppleLogin = () => {
    toast({
        title: 'Coming Soon!',
        description: 'Apple Sign-In is not yet available. Please use another method.'
    })
  }

  const handleGoogleError = () => {
    toast({
      variant: 'destructive',
      title: 'Login Failed',
      description: 'Google authentication failed. Please try again.',
    });
    setIsLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AuthBackgroundImage />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-3xl bg-black/60 p-8 backdrop-blur-lg">
        <div className="mb-8 text-left">
          <h2 className="font-headline text-4xl font-bold leading-tight">
            Log into <br />
            your account
          </h2>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
              <Link href="/forgot-password" className="absolute right-0 top-3 text-sm text-white/70 transition-colors hover:text-white">
                Forgot?
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember-me" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
              <Label htmlFor="remember-me" className="text-white/70">
                Remember me
              </Label>
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full rounded-full bg-stone-900 py-6 text-base font-semibold hover:bg-stone-800">
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
              Or log in with
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex justify-center">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
                auto_select={false}
            />
          </div>
            <Button
                onClick={handleAppleLogin}
                variant="outline"
                className="w-full max-w-[185px] rounded-full border-white/40 bg-[#1f1f1f] text-white hover:bg-white/10 flex items-center justify-center h-[40px] px-3"
                >
                <AppleIcon className="mr-2 text-white" />
                <span className="text-sm font-medium">Sign in with Apple</span>
            </Button>
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-white hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
