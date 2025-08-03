
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
    <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.055 12.352c0 1.34-.44 2.65-1.321 3.929-.823 1.199-1.929 2.25-3.333 2.302-1.429.027-2.112-.76-3.803-.76s-2.327.762-3.803.788c-1.48.052-2.654-1.076-3.477-2.275a6.533 6.533 0 01-1.373-3.981c0-2.327 1.48-3.476 3.016-4.625 1.294-.973 2.679-1.57 4.15-1.57s2.571.572 3.75 1.518c.114-.142.254-.31.394-.476-1.118-.95-2.52-1.545-4.144-1.545-1.572 0-3.048.622-4.201 1.626-1.953 1.68-2.939 4.098-2.939 6.474 0 1.455.44 2.883 1.294 4.144.881 1.286 2.064 2.45 3.55 2.53 1.403.026 2.191-.762 3.882-.762s2.427.762 3.856.737c1.51-.026 2.766-1.15 3.647-2.38.907-1.285 1.347-2.678 1.347-4.17 0-.214-.027-.428-.054-.622h-.053c-.63 1.84-2.19 2.91-3.936 2.91-1.48 0-2.739-.92-3.619-2.22-.989-1.454-1.171-3.306-.52-5.07C16.21 11.2 17.51 10.32 19.11 10.32c.16 0 .32.026.47.052a3.44 3.44 0 00-.525 1.98z"/>
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
                <AppleIcon className="mr-2 h-5 w-5" />
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

    