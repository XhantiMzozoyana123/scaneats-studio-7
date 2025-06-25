import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const features = [
    '24/7 Personal Assistant: SALLY',
    'Unlimited Food Scanning Credits',
    'Detailed Nutritional Analytics',
    'Exclusive Recipe Library Access',
    'Priority Feature Updates',
    'Ad-Free Experience',
  ];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black p-6 text-white">
      <Link
        href="/dashboard"
        className="absolute top-8 left-8 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        &lt; Back
      </Link>

      <h1
        className="relative z-0 mb-[-2rem] font-headline text-[clamp(3rem,10vw,6rem)] font-medium text-white/80"
        style={{
          textShadow: '0 0 4px #fff, 0 0 10px #fff, 0 0 18px #fff',
        }}
      >
        ScanEats.App
      </h1>

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-white/20 bg-stone-800/50 p-8 backdrop-blur-md">
        <div>
          <div className="text-lg font-medium text-gray-300">
            Active Account
          </div>
          <div className="text-5xl font-semibold">
            $11<span className="text-2xl font-normal text-gray-400">/m</span>
          </div>
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="h-3 w-3" />
              </div>
              <span
                className="text-sm text-gray-200"
                dangerouslySetInnerHTML={{
                  __html: feature.replace(
                    'SALLY',
                    '<span class="rounded bg-white/70 px-1.5 py-0.5 font-semibold text-black">SALLY</span>'
                  ),
                }}
              />
            </li>
          ))}
        </ul>

        <Button className="w-full animate-breathe-glow rounded-lg bg-white py-6 text-base font-semibold text-black transition-transform hover:scale-105 hover:bg-gray-200">
          Activate Your Account
        </Button>
      </div>
    </div>
  );
}
