
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Define the interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault(); // Stop the automatic prompt
      setDeferredPrompt(e as BeforeInstallPromptEvent); // Save the event
      setShowButton(true); // Show our custom install button
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // Show the install prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to the install prompt: ${outcome}`);
    
    // We can only use the prompt once, so clear it.
    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full rounded-xl bg-primary py-6 text-lg font-bold text-white shadow-[0_0_20px_4px_hsl(var(--primary)/0.6)] transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_8px_hsl(var(--primary)/0.7)]"
    >
      Download ScanEats.App
    </Button>
  );
}
