'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showBottomNav =
    pathname !== '/dashboard/sally' && pathname !== '/dashboard/meal-plan';

  return (
    <div className="relative h-screen overflow-hidden">
      {children}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
