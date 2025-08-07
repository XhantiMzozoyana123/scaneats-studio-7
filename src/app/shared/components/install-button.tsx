
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { InstallationGuide } from './installation-guide';


export function InstallButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  
  useEffect(() => {
    // This captures the event that the browser fires when it detects a PWA is installable.
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = () => {
    // If we have a deferred prompt (on Android Chrome), we can trigger the install directly.
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null); // The prompt can only be used once.
      });
    } else {
        // For other browsers (like Safari on iOS), we show the manual instructions dialog.
        setIsOpen(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleInstallClick}
        className="w-full rounded-lg bg-primary py-3 text-lg font-bold text-white transition-all hover:bg-primary/90 hover:shadow-[0_0_12px_6px_rgba(127,0,255,0.8)] disabled:opacity-50 animate-breathe-glow"
      >
        Download ScanEats.App
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install ScanEats.App</DialogTitle>
            <DialogDescription>
              Follow the instructions for your device to add ScanEats to your home screen.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <InstallationGuide />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
