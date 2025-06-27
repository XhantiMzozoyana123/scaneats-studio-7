'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Check for auth token on the client side
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.replace('/login');
    } else {
      setIsVerifying(false);
    }
  }, [router]);

  const showBottomNav =
    pathname !== '/dashboard/sally';

  // While verifying, show a loading spinner to prevent flashing of protected content
  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {children}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
