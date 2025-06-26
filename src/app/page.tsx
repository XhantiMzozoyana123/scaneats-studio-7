import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BackgroundImage } from '@/components/background-image';

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center text-white">
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="healthy food abstract"
      />

      <div className="container z-10 mx-auto flex max-w-lg flex-col items-center justify-center text-center">
        <Image
          src="/scaneats-logo.png"
          alt="ScanEats Logo"
          width={120}
          height={120}
          className="mb-6"
        />
        <p className="mb-8 text-lg font-bold">
          Scan your food and Sally, your personal assistant, will tell you
          everything about your meal and about your week.
        </p>
        <Button
          asChild
          size="lg"
          className="animate-breathe-glow rounded-md bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground shadow-[0_0_15px_hsl(var(--accent))] transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_hsl(var(--accent))]"
        >
          <Link href="/signup">Download ScanEats.App</Link>
        </Button>
      </div>

      <footer className="absolute bottom-6 z-10 text-center text-sm text-gray-400">
        © 2024 ScanEats. All rights reserved.
      </footer>
    </main>
  );
}
