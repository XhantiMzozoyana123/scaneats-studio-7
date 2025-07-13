
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault(); // Stop the automatic prompt
      setDeferredPrompt(e as BeforeInstallPromptEvent); // Save the event
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleClick = async () => {
    // If we have the deferred prompt, use it
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Show the install prompt
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User response to the install prompt: ${outcome}`);
      
      // We can only use the prompt once, so clear it.
      setDeferredPrompt(null);
      return;
    }
    
    // If there's no deferred prompt, it could be an iOS device or the app is already installed.
    // We can provide a hint to the user.
    toast({
      title: "Installation",
      description: "To install the app, tap the 'Share' button in your browser and then 'Add to Home Screen'.",
      duration: 5000, // Show the toast for 5 seconds
    });
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full rounded-xl bg-primary py-6 text-lg font-bold text-white shadow-[0_0_20px_4px_hsl(var(--primary)/0.6)] transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_8px_hsl(var(--primary)/0.7)]"
    >
      Download ScanEats.App
    </Button>
  );
}
