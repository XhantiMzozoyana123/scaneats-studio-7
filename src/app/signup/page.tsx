
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthBackgroundImage } from '@/app/shared/components/auth-background-image';
import { User, Mail, KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/app/shared/hooks/use-toast';
import { API_BASE_URL } from '@/app/shared/lib/api';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  nameid: string;
  email: string;
}

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M16.222 10.378c.038-3.407-2.264-4.88-4.323-4.908-1.96-.027-3.715 1.252-4.755 3.003-.993 1.68-.53 4.62 1.137 6.264.915.89 2.02 1.42 3.26 1.392 1.393-.03 2.543-.76 3.68-1.572-.05-3.32-1.09-4.18-3.26-4.208-1.09-.013-2.08.52-2.677 1.218-.013-2.22 1.67-3.483 3.48-3.483a3.2 3.2 0 013.45 3.284zm-6.28 9.062c1.23.04 2.43-.788 3.535-1.635 1.092-.86 2.035-2.24 2.22-3.725-1.467-.027-2.95 1.01-3.76 1.73-.896.79-1.926 1.57-3.21 1.64h-.01c-1.507 0-2.84-1.02-3.62-1.92-1.5-1.74-.92-5.02 1.04-6.8 1.1-.99 2.49-1.55 3.88-1.55 1.29 0 2.4.61 3.2.61.94 0 2.37-.73 3.83-.63.2.004.4.015.6.035-3.2 1.9-3.45 5.72-1.02 8.2.91 1.04 2.12 1.79 3.52 1.79 1.41 0 2.55-.83 3.56-1.7.07.13.14.26.2.39-.7.46-1.5.84-2.36.96-1.7.27-3.43-.48-4.52-1.4-1.03-.89-1.9-2.21-2.18-3.6-.14-.73-.1-1.48.06-2.23-1.47.07-2.94.88-3.83 1.76-.84.76-1.7 1.8-1.7 3.12 0 1.2.53 2.34 1.3 3.03.73.65 1.63 1.06 2.65 1.06z" />
    </svg>
)

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          errorMessage = 'Our servers are currently unavailable. Please try again later.';
        } else {
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
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
      <AuthBackgroundImage />
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
                href="/privacy-policy"
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
        
        <div className="flex flex-col items-center gap-4">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
                auto_select={false}
            />
            <Button
                onClick={handleAppleLogin}
                variant="outline"
                className="w-full max-w-[300px] rounded-full border-white/40 bg-black text-white hover:bg-white/10"
                >
                <AppleIcon className="mr-2 h-5 w-5" />
                Sign in with Apple
            </Button>
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
