'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BackgroundImage } from '@/components/background-image';

export default function DashboardPage() {
  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="healthy food abstract"
        className="blur-sm"
      />
      <main className="relative flex h-full flex-col items-center justify-center space-y-12 px-4 pt-28 pb-32 text-white">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-2">
            <h1
              className="title-gradient font-headline text-4xl font-bold"
              style={{
                textShadow:
                  '0px 1px 1px rgba(0, 0, 0, 0.25), 0px 0px 8px rgba(190, 100, 255, 0.45)',
              }}
            >
              ScanEats
            </h1>
            <h2 className="font-body text-sm font-light text-gray-300">
              Welcome home, wink wink
            </h2>
          </div>
          <p className="max-w-xs text-xl font-light text-gray-200">
            Meet Sally, your personal assistant who’ll help you stay on track with
            your meals and let you know if you&apos;re eating well — without the
            need to constantly go for health foods.
          </p>
        </div>

        <div className="w-full max-w-xs">
           <Button
            asChild
            className="h-24 w-full rounded-2xl bg-primary/80 text-lg uppercase tracking-[0.2em] text-white shadow-none animate-breathe-glow transition-all hover:scale-105"
          >
            <Link href="/dashboard/scan-food">Scan Food</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
