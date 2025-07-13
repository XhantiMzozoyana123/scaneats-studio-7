
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Share, MoreVertical, PlusSquare, Smartphone, ArrowDown, CornerUpRight } from 'lucide-react';

type DeviceType = 'apple' | 'android' | null;

const AppleInstructions = () => (
  <div className="mt-4 space-y-4 text-center">
    <p className="text-sm text-muted-foreground">Follow these steps to add ScanEats to your Home Screen:</p>
    <div className="flex flex-col items-center gap-4 rounded-lg bg-secondary p-4">
      <div className="flex w-full animate-fade-in-1 items-center gap-3 text-left">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">1</span>
        <p>Tap the <strong>Share</strong> icon in your browser's menu bar.</p>
        <Share className="ml-auto h-8 w-8 text-primary" />
      </div>
      <ArrowDown className="h-5 w-5 animate-pulse text-muted-foreground" />
      <div className="flex w-full animate-fade-in-2 items-center gap-3 text-left">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">2</span>
        <p>Scroll down and tap <strong>'Add to Home Screen'</strong>.</p>
        <PlusSquare className="ml-auto h-8 w-8 text-primary" />
      </div>
       <ArrowDown className="h-5 w-5 animate-pulse text-muted-foreground" />
      <div className="flex w-full animate-fade-in-2 items-center gap-3 text-left" style={{animationDelay: '0.4s'}}>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">3</span>
        <p>Finally, tap <strong>'Add'</strong> in the top-right corner.</p>
        <CornerUpRight className="ml-auto h-8 w-8 text-primary" />
      </div>
    </div>
  </div>
);

const AndroidInstructions = ({ onInstallClick }: { onInstallClick: () => void }) => (
    <div className="mt-4 space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Follow these steps to add ScanEats to your Home Screen:</p>
        <div className="flex flex-col items-center gap-4 rounded-lg bg-secondary p-4">
             <div className="flex w-full animate-fade-in-1 items-center gap-3 text-left">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">1</span>
                <p>Tap the <strong>three dots</strong> in the top-right corner.</p>
                <MoreVertical className="ml-auto h-8 w-8 text-primary" />
            </div>
             <ArrowDown className="h-5 w-5 animate-pulse text-muted-foreground" />
             <div className="flex w-full animate-fade-in-2 items-center gap-3 text-left">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">2</span>
                <p>Tap <strong>'Install app'</strong> or <strong>'Add to Home screen'</strong>.</p>
                <Smartphone className="ml-auto h-8 w-8 text-primary" />
            </div>
        </div>
        <Button onClick={onInstallClick} className="w-full mt-4">Try to Install Automatically</Button>
    </div>
);


export function InstallButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [instructionDevice, setInstructionDevice] = useState<DeviceType>(null);
  
  useEffect(() => {
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
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setIsOpen(false);
      });
    }
  };

  const handleButtonClick = () => {
    // If the native prompt is ready on a supported browser (Android), just show it immediately.
    if (deferredPrompt) {
        handleInstallClick();
    } else {
        // Otherwise, open the selection dialog for manual instructions.
        setIsOpen(true);
        setInstructionDevice(null); // Reset to selection screen
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        className="cta-button mt-4 w-full"
      >
        Download ScanEats.App
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install ScanEats.App</DialogTitle>
            <DialogDescription>
              {!instructionDevice
                ? 'Select your device type for installation instructions.'
                : `Installation guide for ${instructionDevice === 'apple' ? 'Apple' : 'Android'}`}
            </DialogDescription>
          </DialogHeader>

          {!instructionDevice ? (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button variant="outline" onClick={() => setInstructionDevice('apple')} className="h-24 flex-col gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                Apple
              </Button>
              <Button variant="outline" onClick={() => setInstructionDevice('android')} className="h-24 flex-col gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 4.2a.3.3 0 0 0-.4-.4l-1.3 1.3a.3.3 0 0 0 0 .4Z"/><path d="M6 18H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h1_a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2h1c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-2"/><path d="M9.3 4.2a.3.3 0 0 1 .4-.4l1.3 1.3a.3.3 0 0 1 0 .4Z"/><path d="M17 10v4"/><path d="M7 10v4"/></svg>
                Android
              </Button>
            </div>
          ) : instructionDevice === 'apple' ? (
            <AppleInstructions />
          ) : (
            <AndroidInstructions onInstallClick={handleInstallClick} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
