'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BackgroundImage } from '@/components/background-image';
import { User, Mail, KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = async (idToken: string) => {
    if (!idToken) {
      throw new Error('Google ID token is missing.');
    }

    const response = await fetch(`${API_BASE_URL}/api/googleauth/onetap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      let errorMsg = 'Google One Tap login failed.';
      try {
          const errorData = await response.json();
          if (errorData.error) {
              errorMsg = errorData.error;
          } else if (errorData.details) {
              errorMsg = errorData.details.map((d: any) => d.description).join(', ');
          }
      } catch {
          // Keep generic message
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (!data.token || !data.user || !data.user.id || !data.user.email) {
      throw new Error('Invalid response received from server.');
    }
    
    return {
      token: data.token,
      userId: data.user.id,
      userEmail: data.user.email,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserName: username,
          Email: email,
          Password: password,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Registration successful. Please log in.',
        });
        router.push('/login');
      } else {
        let errorMessage = 'An unknown error occurred during registration.';
        if (response.status >= 500) {
          errorMessage =
            'Our servers are currently unavailable. Please try again later.';
        } else {
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.details) {
              errorMessage = errorData.details
                .map((d: any) => d.description)
                .join(', ');
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
        title: 'Registration Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <BackgroundImage
        src="https://placehold.co/1200x800.png"
        data-ai-hint="abstract purple"
        className="blur-md"
      />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-3xl bg-black/60 p-8 backdrop-blur-lg">
        <div className="mb-8 text-left">
          <h1 className="font-headline text-4xl font-bold leading-tight">
            Create your
            <br />
            account
          </h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative border-b border-white/40">
            <User className="absolute left-0 top-3 h-5 w-5 text-white/70" />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border-0 bg-transparent pl-8 text-base placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="relative border-b border-white/40">
            <Mail className="absolute left-0 top-3 h-5 w-5 text-white/70" />
            <Input
              type="email"
              placeholder="Email Address"
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
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="terms"
              required
              className="border-primary data-[state=checked]:bg-primary"
            />
            <Label htmlFor="terms" className="text-sm text-white/70">
              I agree to the{' '}
              <Link
                href="#"
                className="font-semibold text-white underline hover:no-underline"
              >
                Terms & Conditions
              </Link>
            </Label>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-stone-900 py-6 text-base font-semibold hover:bg-stone-800"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
            </Button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/40" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black/60 px-2 text-white/70">
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async credentialResponse => {
                if (!credentialResponse.credential) {
                  toast({
                    variant: 'destructive',
                    title: 'Sign Up Failed',
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
                    title: 'Sign Up Successful!',
                    description: 'Welcome to ScanEats.',
                  });
                  router.push('/dashboard');
                } catch (error: any) {
                  toast({
                    variant: 'destructive',
                    title: 'Sign Up Failed',
                    description: error.message,
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
              onError={() => {
                toast({
                  variant: 'destructive',
                  title: 'Sign Up Failed',
                  description: 'Google authentication failed. Please try again.',
                });
              }}
              theme="filled_black"
              shape="rectangular"
              size="large"
            />
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-white hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
