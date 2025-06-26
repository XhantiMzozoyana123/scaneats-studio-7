'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BackgroundImage } from '@/components/background-image';
import Image from 'next/image';

export default function DashboardPage() {
  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="healthy food abstract"
        className="blur-sm"
      />
      <header className="absolute top-4 left-4 z-10">
        <Image
          src="/scaneats-logo.png"
          alt="ScanEats Logo"
          width={80}
          height={80}
        />
      </header>
      <main className="relative flex h-full flex-col items-center justify-center space-y-12 px-4 pt-16 pb-32 text-white">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-2">
            <h1
              className="title-gradient font-headline text-5xl font-bold"
              style={{
                textShadow:
                  '0px 1px 1px rgba(0, 0, 0, 0.25), 0px 0px 8px rgba(190, 100, 255, 0.45)',
              }}
            >
              ScanEats
            </h1>
            <h2 className="font-body text-base font-light text-gray-300">
              Welcome home, wink wink
            </h2>
          </div>
          <p className="max-w-xs text-lg font-normal text-gray-200">
            Meet Sally, your personal assistant who’ll help you stay on track with
            your meals and let you know if you&apos;re eating well — without the
            need to constantly go for health foods.
          </p>
        </div>

        <div className="w-full max-w-xs">
           <Button
            asChild
            className="h-40 w-full rounded-3xl bg-primary text-lg uppercase tracking-[0.2em] text-white animate-breathe-glow transition-all hover:scale-105"
          >
            <Link href="/dashboard/scan-food">Scan Food</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
