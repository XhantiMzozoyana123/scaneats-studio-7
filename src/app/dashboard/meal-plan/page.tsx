'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BackgroundImage } from '@/components/background-image';
import {
  Beef,
  Loader2,
  Mic,
  Milk,
  Utensils,
  Wheat,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ScannedFood = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

// Mock data for UI design
const mockFoods: ScannedFood[] = [
  { id: 1, name: 'Avocado Toast', calories: 290, protein: 12, fat: 15, carbs: 30 },
  { id: 2, name: 'Grilled Chicken Salad', calories: 450, protein: 40, fat: 25, carbs: 15 },
  { id: 3, name: 'Spaghetti Bolognese', calories: 600, protein: 30, fat: 20, carbs: 75 },
  { id: 4, name: 'Fruit Smoothie', calories: 250, protein: 5, fat: 8, carbs: 45 },
  { id: 5, name: 'Salmon with Quinoa', calories: 550, protein: 45, fat: 30, carbs: 25 },
  { id: 6, name: 'Vegetable Stir-fry', calories: 350, protein: 15, fat: 10, carbs: 50 },
];


const MacroCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) => (
  <div className="flex min-w-[90px] flex-1 flex-col items-center justify-center rounded-xl border border-white/10 bg-primary/80 p-3 text-center text-white shadow-lg transition-transform hover:scale-105">
    <div className="mb-1 text-base font-medium [text-shadow:_0_0_10px_white]">
      {label}
    </div>
    <div className="text-xl font-semibold [text-shadow:_0_0_10px_white]">
      {value}
    </div>
  </div>
);

export default function MealPlanPage() {
  const [foods, setFoods] = useState<ScannedFood[]>(mockFoods);
  const { toast } = useToast();

  const totals = useMemo(() => {
    return foods.reduce(
      (acc, food) => {
        acc.calories += food.calories || 0;
        acc.protein += food.protein || 0;
        acc.fat += food.fat || 0;
        acc.carbs += food.carbs || 0;
        return acc;
      },
      { calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  }, [foods]);

  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="abstract food pattern"
        className="blur-sm"
      />
      <div className="z-10 flex h-screen w-full flex-col items-center px-4 pt-12 pb-28">
        <header className="flex w-full max-w-lg items-center justify-between self-start">
          <Image
            src="/scaneats-logo.svg"
            alt="ScanEats Logo"
            width={120}
            height={60}
          />
        </header>

        <section className="my-2 text-center">
          <div className="text-4xl font-bold text-white [text-shadow:_0_0_10px_white]">
            {totals.calories.toFixed(0)}
          </div>
          <div className="mt-1 inline-block rounded-full bg-black/50 px-3 py-1 text-xs text-gray-200">
            Total Calories Today
          </div>
        </section>

        <section className="mb-4 flex w-full max-w-md flex-wrap justify-center gap-2">
          <MacroCard label="Protein" value={`${totals.protein.toFixed(0)}g`} icon={Beef} />
          <MacroCard label="Fat" value={`${totals.fat.toFixed(0)}g`} icon={Milk} />
          <MacroCard label="Carbs" value={`${totals.carbs.toFixed(0)}g`} icon={Wheat} />
        </section>

        <section className="flex w-full flex-grow flex-col items-center justify-center gap-4">
          <Link
            href="/dashboard/sally?intent=meal-plan"
            className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-gradient-to-r from-purple-800 to-indigo-900 shadow-2xl transition-transform hover:scale-105"
          >
            <Mic className="h-8 w-8 text-white" />
          </Link>
          <p className="max-w-xs rounded-lg border-l-4 border-accent bg-background/50 p-2 text-center text-xs text-muted-foreground shadow-md">
            Ask me about this meal and I&apos;ll tell you everything
          </p>
        </section>
      </div>
    </>
  );
}
