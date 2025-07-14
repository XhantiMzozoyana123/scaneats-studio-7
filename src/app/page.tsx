
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { BackgroundImage } from '@/components/background-image';
import { InstallButton } from '@/components/install-button';

function LandingContent() {
  return (
    <>
      <BackgroundImage
        src="https://gallery.scaneats.app/images/LandingPageSignup&SigninPage.webm"
        className="blur-sm"
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-4">
        <div className="frosted-card flex w-full max-w-sm flex-col items-center gap-6 p-8">
            <Image
                src="https://gallery.scaneats.app/images/ScanEatsLogo.png"
                alt="ScanEats Logo"
                width={120}
                height={120}
                className="max-h-[120px] w-auto"
            />
            <p className="text-center text-lg text-gray-200">
                Scan your food and Sally, your personal assistant, will have a
                conversation with you about what you have been eating and if its
                working for you or not.
            </p>
        </div>
        <div className="mt-8 w-full max-w-xs">
           <InstallButton />
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [view, setView] = useState<'loading' | 'pwa' | 'browser'>('loading');

  useEffect(() => {
    const isPwa = window.matchMedia('(display-mode: standalone)').matches;

    if (isPwa) {
      setView('pwa');
      const token = localStorage.getItem('authToken');
      if (token) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    } else {
      setView('browser');
    }
  }, [router]);

  if (view === 'loading' || view === 'pwa') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading App...</p>
      </div>
    );
  }

  return <LandingContent />;
}
