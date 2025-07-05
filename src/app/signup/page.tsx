'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BackgroundImage } from '@/components/background-image';
import { User, Mail, KeyRound, Loader2, Apple } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

const GoogleIcon = () => (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_17_80)"><path fill="#FFC107" d="M43.611 20.083H42V20H24V28H35.303C33.674 32.69 29.213 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L38.414 8.586C34.823 5.312 29.821 3 24 3C12.954 3 4 11.954 4 23C4 34.046 12.954 43 24 43C34.364 43 43.103 35.532 43.611 25.083V20.083Z"/><path fill="#FF3D00" d="M6.306 14.691L12.553 19.439C14.136 15.352 18.591 12 24 12C27.059 12 29.842 13.154 31.961 15.039L38.414 8.586C34.823 5.312 29.821 3 24 3C17.433 3 11.758 6.946 8.083 12.106L6.306 14.691Z"/><path fill="#4CAF50" d="M24 44C29.482 44 34.225 42.022 37.899 38.644L32.043 33.594C30.085 35.093 27.221 36 24 36C18.673 36 14.136 32.69 12.553 28.061L6.306 32.893C9.976 39.462 16.425 44 24 44Z"/><path fill="#1976D2" d="M43.6116 24H24V32H35.3031C34.5126 34.755 32.7486 36.9993 30.4381 38.4853L30.4346 38.4886L36.3196 43.3346C36.3196 43.3346 36.3196 43.3346 36.3196 43.3346C40.4616 39.7396 43.0016 34.1876 43.0016 28C43.0016 26.4356 42.8716 25.2156 42.6116 24Z"/></g><defs><clipPath id="clip0_17_80"><rect width="48" height="48" fill="white"/></clipPath></defs></svg>
);

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSSOLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/sso-callback`;
      const response = await fetch(`${API_BASE_URL}/api/Auth/sso/login-url?provider=${provider}&redirectUri=${encodeURIComponent(redirectUri)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          localStorage.setItem('sso_provider', provider);
          window.location.href = data.url;
        } else {
          throw new Error('SSO login URL not provided by the server.');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve SSO login URL.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'SSO Error',
        description: error.message,
      });
      setIsLoading(false);
    }
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
          userName: username,
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Registration successful. Please log in.',
        });
        router.push('/');
      } else {
        let errorMessage = 'An unknown error occurred during registration.';
        if (response.status >= 500) {
          errorMessage = 'Our servers are currently unavailable. Please try again later.';
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
        
        <div className="space-y-4">
            <Button variant="outline" onClick={() => handleSSOLogin('apple')} disabled={isLoading} className="w-full rounded-full border-transparent bg-white py-6 text-base font-semibold text-black hover:bg-gray-200">
              <Apple className="mr-2 h-6 w-6" /> Sign up with Apple
            </Button>
            
            <Button variant="outline" onClick={() => handleSSOLogin('google')} disabled={isLoading} className="w-full rounded-full border-transparent bg-white py-6 text-base font-semibold text-black hover:bg-gray-200">
                <GoogleIcon />
                 Sign up with Google
            </Button>
        </div>


        <p className="mt-8 text-center text-sm text-white/70">
          Already have an account?{' '}
          <Link
            href="/"
            className="font-semibold text-white hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
