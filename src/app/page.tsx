
'use client';

import Image from 'next/image';
import { InstallButton } from '@/components/install-button';
import Link from 'next/link';

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
        
        <InstallButton />

      </main>

      <footer className="absolute bottom-6 z-20 text-center text-sm text-white/80">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold underline hover:no-underline">
            Log In
          </Link>
        </p>
      </footer>
    </div>
  );
}
