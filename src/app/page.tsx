
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // This is the PWA entry point.
    // It should immediately redirect to the correct page based on auth status.
    // The /download page will now serve as the browser landing page.
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
            router.replace('/dashboard');
        } else {
            router.replace('/login');
        }
    }
  }, [router]);

  // Render a loading spinner while the redirect happens.
  // This page will never be fully visible.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading App...</p>
    </div>
  );
}
