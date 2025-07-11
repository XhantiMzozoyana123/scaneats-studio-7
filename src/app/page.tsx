
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://gallery.scaneats.app/images/Landing%20page%20LP.gif"
        alt="A delicious meal on a plate"
        layout="fill"
        objectFit="cover"
        className="z-0"
        priority
        unoptimized
      />
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 z-20 text-center text-sm text-white/80">
        <p>&copy; {new Date().getFullYear()} ScanEats. All rights reserved.</p>
        <div className="mt-2 space-x-4">
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link href="/contact" className="hover:underline">Contact Us</Link>
        </div>
      </footer>

      {/* Centered Content Card */}
      <main className="relative z-20 flex w-full max-w-sm flex-col items-center rounded-3xl bg-white/20 p-8 text-center text-white backdrop-blur-lg">
        <Image
          src="https://gallery.scaneats.app/images/ScanEatsLogo.png"
          alt="ScanEats Logo"
          width={100}
          height={100}
          className="mb-4"
        />
        <p className="mb-8 font-body text-lg leading-relaxed">
          Scan your food and Sally, your personal assistant, will have a
          conversation with you about what you have been eating and if its
          working for you or not.
        </p>
        <Button
          asChild
          className="w-full rounded-xl bg-primary py-6 text-lg font-bold text-white shadow-[0_0_20px_4px_hsl(var(--primary)/0.6)] transition-all hover:bg-primary/90 hover:shadow-[0_0_25px_8px_hsl(var(--primary)/0.7)]"
        >
          <Link href="/signup">Download ScanEats.App</Link>
        </Button>
        <p className="mt-4 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Log In
          </Link>
        </p>
      </main>
    </div>
  );
}
