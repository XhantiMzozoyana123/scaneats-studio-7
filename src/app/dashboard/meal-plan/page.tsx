'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BackgroundImage } from '@/components/background-image';
import { Beef, Mic, Milk, Wheat, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ScannedFood = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

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
  const [foods, setFoods] = useState<ScannedFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFoodReferences = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'You must be logged in to view your meal plan.',
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/food/references`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch meal plan.');
        }

        const data = await response.json();
        // Assuming the API returns PascalCase properties, we map them to our camelCase type.
        const formattedData: ScannedFood[] = data.map((food: any) => ({
          id: food.Id,
          name: food.Name,
          calories: food.Calories,
          protein: food.Protein,
          fat: food.Fat,
          carbs: food.Carbs,
        }));
        setFoods(formattedData);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch your meal plan. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodReferences();
  }, [toast]);

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

  if (isLoading) {
    return (
      <>
        <BackgroundImage
          src="https://placehold.co/1920x1080.png"
          data-ai-hint="abstract food pattern"
          className="blur-sm"
        />
        <div className="z-10 flex h-screen w-full flex-col items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-white" />
          <p className="mt-4 text-white">Loading your meal plan...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="abstract food pattern"
        className="blur-sm"
      />
      <div className="z-10 flex h-screen w-full flex-col items-center px-4 pt-4 pb-28">
        <header className="flex w-full max-w-lg items-center justify-between self-start">
          <Image
            src="/scaneats-logo.png"
            alt="ScanEats Logo"
            width={80}
            height={80}
          />
        </header>

        <section className="mb-4 text-center">
          <div className="text-4xl font-bold text-white [text-shadow:_0_0_10px_white]">
            {totals.calories.toFixed(0)}
          </div>
          <div className="mt-1 inline-block rounded-full bg-black/50 px-3 py-1 text-xs text-gray-200">
            Total Calories Today
          </div>
        </section>

        <section className="mb-4 flex w-full max-w-md flex-wrap justify-center gap-2">
          <MacroCard
            label="Protein"
            value={`${totals.protein.toFixed(0)}g`}
            icon={Beef}
          />
          <MacroCard label="Fat" value={`${totals.fat.toFixed(0)}g`} icon={Milk} />
          <MacroCard
            label="Carbs"
            value={`${totals.carbs.toFixed(0)}g`}
            icon={Wheat}
          />
        </section>

        <section className="mt-6 flex w-full flex-col items-center gap-5">
          <Link
            href="/dashboard/sally?intent=meal-plan"
            className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-gradient-to-r from-purple-800 to-indigo-900 shadow-2xl transition-transform hover:scale-105"
          >
            <Mic className="h-10 w-10 text-white" />
          </Link>
          <p className="max-w-xs rounded-lg border-l-4 border-accent bg-background/50 p-3 text-center text-sm text-muted-foreground shadow-md">
            Ask me about this meal and I&apos;ll tell you everything
          </p>
        </section>
      </div>
    </>
  );
}
