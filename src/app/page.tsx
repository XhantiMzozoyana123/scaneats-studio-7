
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}


export default function Home() {
  const { toast } = useToast();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      // This case should ideally not be hit if the button is only shown when installPrompt is set.
      toast({
        title: "App can't be installed",
        description: "Your browser doesn't support PWA installation, or the app is already installed.",
      });
      return;
    }
    // Show the install prompt
    await installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    // We've used the prompt, and can't use it again, so clear it
    setInstallPrompt(null);
    console.log(`User response to the install prompt: ${outcome}`);
  };


  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://gallery.scaneats.app/images/Landing%20page%20LP.gif"
        alt="A delicious meal on a plate"
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
        {installPrompt && (
          <Button
            onClick={handleInstallClick}
            className="w-full rounded-xl bg-primary py-6 text-lg font-bold text-white shadow-[0_0_20px_4px_hsl(var(--primary)/0.6)] transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_8px_hsl(var(--primary)/0.7)]"
          >
            Download ScanEats.App
          </Button>
        )}
      </main>
    </div>
  );
}
