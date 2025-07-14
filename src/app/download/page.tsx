
'use client';

import Image from 'next/image';
import { AuthBackgroundImage } from '@/components/auth-background-image';
import { InstallButton } from '@/components/install-button';

export default function DownloadPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <AuthBackgroundImage />
      <div className="relative z-10 flex flex-col items-center gap-6 rounded-3xl bg-black/60 p-8 shadow-2xl backdrop-blur-lg w-full max-w-sm">
          <Image
              src="https://gallery.scaneats.app/images/ScanEatsLogo.png"
              alt="ScanEats Logo"
              width={120}
              height={120}
              className="max-h-[120px] w-auto"
          />
          <p className="text-center text-lg text-gray-200">
              Scan your food and Sally, your personal assistant, will have a
              conversation with you about what you have been eating and if its
              working for you or not.
          </p>
          <div className="w-full max-w-xs">
            <InstallButton />
          </div>
      </div>
    </div>
  );
}
