'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, Mic, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/meal-plan', icon: UtensilsCrossed, label: 'Meal Plan' },
  { href: '/dashboard/sally', icon: Mic, label: 'SallyPA' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2">
      <div className="mb-2 text-center text-xs text-gray-400">
        Powered by ScanEats
      </div>
      <div className="flex h-20 items-center justify-around rounded-2xl bg-stone-900/80 p-2 backdrop-blur-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={item.href}
              className="flex flex-1 flex-col items-center gap-1 text-gray-400 transition-colors hover:text-white"
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-all',
                  isActive &&
                    'scale-110 bg-primary shadow-[0_0_10px_2px_hsl(var(--primary))]'
                )}
              >
                <item.icon
                  className={cn('h-7 w-7', isActive && 'text-white')}
                />
              </div>
              <span className={cn('text-xs', isActive && 'text-white')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
