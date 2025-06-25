import { BackgroundImage } from '@/components/background-image';
import { Mic, X } from 'lucide-react';
import Link from 'next/link';

export default function SallyPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <BackgroundImage
        src="https://placehold.co/1200x800.png"
        data-ai-hint="abstract waves"
        className="blur-none"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/20 via-purple-300/20 to-pink-300/20" />

      <Link
        href="/dashboard"
        className="absolute top-6 left-6 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white/80 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white/30"
      >
        <X />
      </Link>

      <div className="z-10 flex flex-col items-center gap-8 rounded-3xl bg-white/50 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="absolute h-full w-full animate-siri-wave-1 rounded-full border-2 border-white/60" />
          <div className="absolute h-full w-full animate-siri-wave-2 rounded-full border-2 border-white/60" />
          <div className="absolute h-full w-full animate-siri-wave-3 rounded-full border-2 border-white/60" />
          <div className="absolute h-full w-full animate-siri-wave-4 rounded-full border-2 border-white/60" />

          <button className="z-10 flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg transition-transform active:scale-95">
            <Mic className="h-10 w-10 text-white" />
          </button>
        </div>

        <div className="rounded-xl bg-white/80 px-4 py-3 text-center shadow-inner">
          <p className="font-semibold text-gray-800">
            Sally
            <span className="font-normal text-gray-600">
              {' '}
              - I&apos;m your personal assistant, ask me anything.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
