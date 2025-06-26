import { BackgroundImage } from '@/components/background-image';
import { Beef, Mic, Milk, Wheat } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const MacroCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) => (
  <div className="flex min-w-[90px] flex-1 flex-col items-center justify-center rounded-xl border border-white/10 bg-primary/80 p-4 text-center text-white shadow-lg transition-transform hover:scale-105">
    <div className="mb-2 text-lg font-medium [text-shadow:_0_0_10px_white]">
      {label}
    </div>
    <div className="text-2xl font-semibold [text-shadow:_0_0_10px_white]">
      {value}
    </div>
  </div>
);

export default function MealPlanPage() {
  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="abstract food pattern"
        className="blur-sm"
      />
      <div className="z-10 flex w-full flex-grow flex-col items-center p-4">
        <header className="mb-4 flex w-full max-w-lg items-center justify-between self-start">
          <Image
            src="/scaneats-logo.svg"
            alt="ScanEats Logo"
            width={120}
            height={60}
          />
        </header>

        <section className="my-8 text-center">
          <div className="text-6xl font-bold text-white [text-shadow:_0_0_10px_white]">
            2300
          </div>
          <div className="mt-2 inline-block rounded-full bg-black/50 px-3 py-1 text-sm text-gray-200">
            Total Calories
          </div>
        </section>

        <section className="mb-8 flex w-full max-w-md flex-wrap justify-center gap-4">
          <MacroCard label="Protein" value="50g" icon={Beef} />
          <MacroCard label="Fat" value="80g" icon={Milk} />
          <MacroCard label="Carbs" value="200g" icon={Wheat} />
        </section>

        <section className="mt-auto flex flex-col items-center gap-4 pb-4">
          <Link
            href="/dashboard/sally"
            className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-gradient-to-r from-purple-800 to-indigo-900 animate-breathe-glow shadow-2xl transition-transform hover:scale-105"
          >
            <Mic className="h-14 w-14 text-white" />
          </Link>
          <p className="max-w-xs rounded-lg border-l-4 border-accent bg-background/50 p-4 text-center text-muted-foreground shadow-md">
            Ask me about this meal and I&apos;ll tell you everything
          </p>
        </section>
      </div>
    </>
  );
}
