
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { InstallButton } from '@/components/install-button';
import { BackgroundImage } from '@/components/background-image';

function LandingContent() {
  return (
    <>
      <BackgroundImage
        src="https://gallery.scaneats.app/images/LandingPageSignup&SigninPage.webm"
        className="blur-sm"
      />
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center text-white">
        <h1 className="main-title">ScanEats.App</h1>
        <p className="mt-8 max-w-lg text-lg text-gray-300">
          Scan your food and Sally, your personal assistant, will have a
          conversation with you about what you have been eating and if its
          working for you or not.
        </p>
        <div className="mt-10 w-full max-w-xs">
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
    // Check if running as an installed PWA
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
      // It's running in a browser
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
