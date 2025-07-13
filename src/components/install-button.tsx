
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function InstallButton() {
  const { toast } = useToast();
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  const handleClick = async () => {
    const deferredPrompt = window.deferredPrompt;
    
    if (deferredPrompt) {
      // Show the native install prompt on supported browsers
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      window.deferredPrompt = null; // The prompt can only be used once.
    } else {
      // Fallback for browsers that don't support the prompt (e.g., Safari)
      // Show a helpful dialog with manual instructions
      setShowInstallDialog(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className="w-full rounded-xl bg-primary py-6 text-lg font-bold text-white shadow-[0_0_20px_4px_hsl(var(--primary)/0.6)] transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_8px_hsl(var(--primary)/0.7)]"
      >
        Download ScanEats.App
      </Button>

      <AlertDialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Install ScanEats.App</AlertDialogTitle>
            <AlertDialogDescription>
              To install the app on your device, please follow these simple steps:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Tap the <strong>Share</strong> icon in your browser's toolbar.</li>
                <li>Scroll down and tap <strong>'Add to Home Screen'</strong>.</li>
              </ol>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowInstallDialog(false)}>
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
