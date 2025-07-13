
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { InstallButton } from '@/components/install-button';

function StandaloneView() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}


function BrowserView() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="A delicious meal being prepared in a pan"
        data-ai-hint="food cooking"
        layout="fill"
        objectFit="cover"
        className="z-0"
        priority
        unoptimized
      />
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Centered Content Card */}
      <main className="relative z-20 flex w-full max-w-sm flex-col items-center rounded-3xl bg-white/20 p-8 text-center text-white backdrop-blur-lg">
        <Image
          src="https://gallery.scaneats.app/images/ScanEatsLogo.png"
          alt="ScanEats Logo"
          width={100}
          height={100}
          className="mb-4"
        />
        <p className="mb-8 font-body text-lg leading-relaxed">
          Scan your food and Sally, your personal assistant, will have a
          conversation with you about what you have been eating and if its
          working for you or not.
        </p>
        
        <InstallButton />

      </main>

      <footer className="absolute bottom-6 z-20 text-center text-sm text-white/80">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold underline hover:no-underline">
            Log In
          </Link>
        </p>
      </footer>
    </div>
  );
}

export default function HomePage() {
  const [view, setView] = useState<'loading' | 'browser' | 'standalone'>('loading');

  useEffect(() => {
    // Check if the app is running in standalone (PWA) mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setView('standalone');
    } else {
      setView('browser');
    }
  }, []);

  if (view === 'loading') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (view === 'standalone') {
    return <StandaloneView />;
  }

  return <BrowserView />;
}
