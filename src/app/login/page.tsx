
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
        <path d="M12.01,16.22c-1.44,0-2.38-0.94-3.57-0.94c-1.23,0-2.29,0.91-3.48,0.91c-1.17,0-2.22-0.8-3.03-2.01 c-1.39-2.04-1.42-4.95,0.22-7.14c0.88-1.18,2.38-2.01,3.94-2.01c1.11,0,2.13,0.66,2.94,0.66c0.78,0,1.96-0.73,3.3-0.73 c1.53,0,2.9,0.83,3.69,2.23C16.29,9.45,15.23,12.34,17.4,14.05c-1.05,1.25-2.29,1.99-3.86,2.05C12.96,16.14,12.49,16.22,12.01,16.22z M14.65,5.16C14.04,4.2,13.06,3.58,11.96,3.58c-1.48,0-2.93,0.95-3.79,2.35c-0.8,1.3-1.25,2.99-0.89,4.64 c0.54,0.06,1.15,0.3,1.79,0.79c0.58,0.45,1.06,0.97,1.66,0.97c0.58,0,1.11-0.52,1.81-0.94c-0.2-1.39,0.52-2.8,1.11-3.64 C16.02,6.96,15.36,5.92,14.65,5.16z"/>
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

          <div className="flex items-center justify-between">
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

    