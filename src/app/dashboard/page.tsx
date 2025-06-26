import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BackgroundImage } from '@/components/background-image';

export default function DashboardPage() {
  return (
    <main className="relative flex h-full flex-col items-center justify-center pb-28 text-white">
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="healthy food abstract"
        className="blur-sm"
      />

      <div id="logo-container" className="absolute top-5 left-5 z-10">
        <Image
          src="/scaneats-logo.png"
          alt="ScanEats Logo"
          width={120}
          height={120}
        />
      </div>

      <div className="z-10 flex flex-col items-center px-4 text-center">
        <h1
          className="title-gradient font-headline text-4xl font-bold md:text-6xl"
          style={{
            textShadow:
              '0px 2px 2px rgba(0, 0, 0, 0.25), 0px 0px 10px rgba(190, 100, 255, 0.45)',
          }}
        >
          ScanEats
        </h1>
        <h2 className="mt-2 font-body text-base font-light text-gray-200 md:text-xl">
          Welcome home, wink wink
        </h2>
        <p className="mt-4 max-w-sm text-sm text-gray-300 md:max-w-md md:text-base">
          Meet Sally, your personal assistant who’ll help you stay on track with
          your meals and let you know if you&apos;re eating well — without the
          need to constantly go for health foods.
        </p>

        <Button
          asChild
          className="mt-8 h-32 w-64 rounded-3xl bg-primary/90 text-base uppercase tracking-widest text-white shadow-[0_10px_60px_15px_rgba(127,0,255,0.7)] transition-all hover:scale-105 hover:shadow-[0_12px_70px_20px_rgba(140,30,255,0.8)] md:h-40 md:w-72 md:text-lg"
        >
          <Link href="/dashboard/scan-food">Scan Food</Link>
        </Button>
      </div>
    </main>
  );
}
