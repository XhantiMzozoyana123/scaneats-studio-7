'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { UserDataProvider, useUserData } from '@/context/user-data-context';
import { Button } from '@/components/ui/button';
import { BackgroundImage } from '@/components/background-image';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLoading, isSubscriptionError } = useUserData();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (isSubscriptionError) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-5 text-white">
        <BackgroundImage
          src="https://placehold.co/1200x800.png"
          data-ai-hint="abstract purple"
          className="blur-md"
        />
        <div className="relative z-10 rounded-2xl border border-white/15 bg-black/60 p-8 text-center shadow-2xl backdrop-blur-lg">
          <h1 className="text-3xl font-bold">Subscription Required</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            You need an active subscription to access your dashboard.
            <br />
            Please subscribe to unlock all features.
          </p>
          <Button asChild className="cta-button mt-8">
            <Link href="/pricing">Subscribe Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
    } else {
      setIsVerifying(false);
    }
  }, [router]);

  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserDataProvider>
      <DashboardContent>{children}</DashboardContent>
    </UserDataProvider>
  );
}
