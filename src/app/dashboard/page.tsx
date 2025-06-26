'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [background, setBackground] = useState({
    src: 'https://placehold.co/1920x1080.png',
    hint: 'food abstract day',
  });

  useEffect(() => {
    const currentHour = new Date().getHours();
    // Night time: 7 PM (19) to 7:59 AM (8)
    if (currentHour >= 19 || currentHour < 8) {
      setBackground({
        src: 'https://placehold.co/1920x1080.png',
        hint: 'food abstract dark',
      });
    } else {
      setBackground({
        src: 'https://placehold.co/1920x1080.png',
        hint: 'food abstract day',
      });
    }
  }, []);

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <Image
          src={background.src}
          alt="Animated background"
          fill
          className="object-cover blur-[2.5px]"
          quality={90}
          priority
          data-ai-hint={background.hint}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <header className="absolute top-1 left-1 z-10 h-10 w-24">
        <Image
          src="/scaneats-logo.png"
          alt="ScanEats Logo"
          fill
          style={{objectFit: 'contain'}}
        />
      </header>

      <main className="relative z-10 flex h-full flex-col items-center justify-center overflow-y-auto px-4 pb-28 pt-12 text-center text-white">
        <div className="space-y-4">
          <h1
            className="title-gradient font-headline text-5xl font-bold md:text-6xl"
            style={{
              textShadow:
                '0px 2px 2px rgba(0, 0, 0, 0.25), 0px 0px 10px rgba(190, 100, 255, 0.45)',
            }}
          >
            ScanEats
          </h1>
          <h2 className="font-body text-xl font-light text-gray-200 opacity-90 md:text-2xl">
            Welcome home, wink wink
          </h2>
          <p className="mx-auto max-w-md font-body text-base leading-relaxed text-gray-300 opacity-95 md:text-lg">
            Meet Sally, your personal assistant who’ll help you stay on track with
            your meals and let you know if you&apos;re eating well — without the
            need to constantly go for health foods.
          </p>
        </div>

        <Button
          asChild
          className="mt-8 h-[199px] w-full max-w-[336px] rounded-3xl bg-primary/90 text-xl font-light uppercase tracking-[2px] text-white animate-breathe-glow transition-all hover:animate-none hover:shadow-[0_12px_70px_20px_rgba(140,30,255,0.8)] focus:scale-105"
        >
          <Link href="/dashboard/scan-food">Scan Food</Link>
        </Button>
      </main>
    </>
  );
}
