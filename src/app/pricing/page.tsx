'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const FeatureListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-center text-sm text-gray-300">
    <div className="mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
      ✓
    </div>
    {children}
  </li>
);

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ variant: 'destructive', title: 'Authentication Error' });
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router, toast]);


  const handleSubscribe = async () => {
    setIsSubscribing(true);
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');

    if (!token || !email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User information not found. Please log in again.',
      });
      setIsSubscribing(false);
      return;
    }
    
    const subscriptionPlanCode = 'PLN_h212vaz6f2wp54w';

    try {
      const response = await fetch(
        `https://api.scaneats.app/api/subscription/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email,
            plan: subscriptionPlanCode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Subscription failed.');
      }

      const result = await response.json();
      if (result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        throw new Error('Payment URL not received.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Subscription Error',
        description: error.message,
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-black p-5 text-gray-200">
       <Link
        href="/dashboard/settings"
        className="absolute top-8 left-8 z-10 inline-block rounded-full border border-white/10 bg-zinc-800/60 py-2.5 px-4 text-sm font-medium text-white no-underline transition-colors hover:bg-zinc-700/80"
      >
        <div className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </div>
      </Link>

      <h1 className="main-title relative z-[1]">
        ScanEats.App
      </h1>

      <div className="relative z-[2] mt-5 w-full max-w-sm rounded-2xl border border-white/15 bg-[#2d2d2d]/45 p-10 text-left shadow-2xl backdrop-blur-[8px]">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-base font-medium text-gray-400">
                Active Account
              </div>
              <div className="mt-2 text-5xl font-semibold text-white">
                $11
                <span className="text-xl font-normal text-gray-400">/m</span>
              </div>
            </div>

            <ul className="flex list-none flex-col gap-4 p-0">
              <FeatureListItem>
                 24/7 Personal Assistant:
                 <span className="ml-1.5 rounded-sm bg-white/70 px-1 py-0.5 font-semibold text-black">
                   SALLY
                 </span>
               </FeatureListItem>
              <FeatureListItem>50 Monthly Food Scanning Credits</FeatureListItem>
              <FeatureListItem>Detailed Nutritional Analytics</FeatureListItem>
              <FeatureListItem>Ad-Free Experience</FeatureListItem>
            </ul>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isSubscribing}
                   className="cta-button mt-4 animate-breathe-glow-white"
                >
                  {isSubscribing ? (
                    <Loader2 className="mx-auto animate-spin" />
                  ) : (
                    'Activate Your Account'
                  )}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Your Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to subscribe to the Active Account plan for
                    $11/month. This includes 50 credits, delivered monthly.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubscribe} disabled={isSubscribing}>
                    {isSubscribing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Confirm & Pay
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}
