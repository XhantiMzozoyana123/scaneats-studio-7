
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


export function InstallButton() {
  const { toast } = useToast();

  const handleClick = async () => {
    const deferredPrompt = window.deferredPrompt;
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      window.deferredPrompt = null; // The prompt can only be used once.
    } else {
      toast({
        title: "App Installation",
        description: "To install the app, use your browser's 'Add to Home Screen' feature.",
        duration: 5000,
      });
    }
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
