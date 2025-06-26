import { Mic, X } from 'lucide-react';
import Link from 'next/link';

export default function SallyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f0e8f8_0%,#e8eaf6_50%,#f0f4f8_100%)]">
      {/* Close Button */}
      <Link
        href="/dashboard"
        aria-label="Close"
        className="absolute top-6 left-6 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-gray-200 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white/40 hover:text-white"
        style={{
          textShadow:
            '1px 1px 2px rgba(0, 0, 0, 0.7), 0 0 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        <X size={18} />
      </Link>

      {/* AI Assistant Card */}
      <div className="flex w-80 flex-col items-center gap-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_20px_55px_8px_rgba(110,100,150,0.45)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Breathing Glow */}
          <div className="absolute top-1/2 left-1/2 z-0 h-[160%] w-[160%] animate-breathe-glow-sally rounded-full [background:radial-gradient(circle_at_center,rgba(255,235,255,0.7)_10%,rgba(200,190,255,0.8)_40%,rgba(170,220,255,1.0)_65%,rgba(200,240,255,1.0)_72%,rgba(135,206,250,0)_80%)]"></div>

          {/* Siri Waves */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2">
            <div className="absolute h-full w-full animate-siri-wave-1 rounded-full border-2 border-white/60"></div>
            <div className="absolute h-full w-full animate-siri-wave-2 rounded-full border-2 border-white/60"></div>
            <div className="absolute h-full w-full animate-siri-wave-3 rounded-full border-2 border-white/60"></div>
            <div className="absolute h-full w-full animate-siri-wave-4 rounded-full border-2 border-white/60"></div>
          </div>

          {/* Mic Button */}
          <button
            role="button"
            aria-label="Activate Voice AI"
            className="z-20 flex h-20 w-20 items-center justify-center rounded-full bg-[#4629B0] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.4),0_0_15px_5px_rgba(255,255,255,0.8),0_0_30px_15px_rgba(255,255,255,0.5),0_0_50px_25px_rgba(220,230,255,0.3)] transition-all active:scale-95 active:bg-[#3c239a] active:shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.3),0_0_10px_3px_rgba(255,255,255,0.7),0_0_20px_10px_rgba(255,255,255,0.4),0_0_40px_20px_rgba(220,230,255,0.2)]"
          >
            <Mic
              className="h-10 w-10 text-white"
              style={{
                textShadow:
                  '0 1px 2px rgba(0,0,0,0.2), 0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(180,140,255,0.7)',
              }}
            />
          </button>
        </div>

        {/* Info Box */}
        <div className="w-full rounded-2xl border border-white/40 bg-white/80 p-3 text-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_10px_30px_3px_rgba(100,90,140,0.45)] backdrop-blur-lg backdrop-saturate-150">
          <p className="text-sm leading-normal text-black">
            <strong className="font-bold">Sally</strong>
            <span className="text-gray-600">
              {' '}
              - I&apos;m your personal assistant, ask me anything.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
