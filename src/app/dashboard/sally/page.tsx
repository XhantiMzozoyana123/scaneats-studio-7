'use client';

import Link from 'next/link';
import { X, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SallyPage() {
  return (
    // Main container with gradient background
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f0e8f8_0%,#e8eaf6_50%,#f0f4f8_100%)]">
      {/* Back button */}
      <Link
        href="/dashboard"
        aria-label="Close"
        className="absolute top-6 left-6 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white/40"
        style={{
          textShadow:
            '1px 1px 2px rgba(0, 0, 0, 0.7), 0 0 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        <X size={18} />
      </Link>

      {/* AI Card */}
      <div className="flex w-[320px] flex-col items-center gap-6 rounded-[25px] border border-[rgba(220,220,235,0.35)] bg-white/70 p-6 shadow-[0_20px_55px_8px_rgba(110,100,150,0.45)] backdrop-blur-[25px] backdrop-saturate-150">
        <div className="relative flex h-[130px] w-[130px] items-center justify-center">
          {/* Breathing Glow Pseudo-element */}
          <div
            className="absolute top-1/2 left-1/2 h-[160%] w-[160%] animate-breathe-glow-sally"
            style={{
              background:
                'radial-gradient(circle at center, rgba(255, 235, 255, 0.7) 10%, rgba(200, 190, 255, 0.8) 40%, rgba(170, 220, 255, 1.0) 65%, rgba(200, 240, 255, 1.0) 72%, rgba(135, 206, 250, 0) 80%)',
              zIndex: 1,
            }}
          />

          {/* Siri Waves */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: 2 }}
          >
            <div className="absolute top-0 left-0 h-full w-full animate-siri-wave-1 rounded-full border-2 border-white/60 opacity-0" />
            <div className="absolute top-0 left-0 h-full w-full animate-siri-wave-2 rounded-full border-2 border-white/60 opacity-0" />
            <div className="absolute top-0 left-0 h-full w-full animate-siri-wave-3 rounded-full border-2 border-white/60 opacity-0" />
            <div className="absolute top-0 left-0 h-full w-full animate-siri-wave-4 rounded-full border-2 border-white/60 opacity-0" />
          </div>

          {/* Mic Button */}
          <button
            role="button"
            aria-label="Activate Voice AI"
            className="flex h-20 w-20 items-center justify-center rounded-full border-none bg-[#4629B0] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.4),0_0_15px_5px_rgba(255,255,255,0.8),0_0_30px_15px_rgba(255,255,255,0.5),0_0_50px_25px_rgba(220,230,255,0.3)] transition-transform duration-200 ease-out active:scale-95 active:bg-[#3c239a] active:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.3),0_0_10px_3px_rgba(255,255,255,0.7),0_0_20px_10px_rgba(255,255,255,0.4),0_0_40px_20px_rgba(220,230,255,0.2)]"
            style={{ zIndex: 3 }}
          >
            <Mic
              size={38}
              className="text-white"
              style={{
                textShadow:
                  '0 1px 2px rgba(0, 0, 0, 0.2), 0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(180, 140, 255, 0.7)',
              }}
            />
          </button>
        </div>

        {/* Info Box */}
        <div className="w-full rounded-[15px] border border-[rgba(220,220,235,0.4)] bg-white/80 p-3 text-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_10px_30px_3px_rgba(100,90,140,0.45)] backdrop-blur-sm backdrop-saturate-150">
          <p className="text-[13px] leading-[1.5] text-black">
            <strong>Sally</strong>
            <span className="text-stone-600">
              {' '}
              - I&apos;m your personal assistant, ask me anything.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
