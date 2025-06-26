'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BackgroundImage } from '@/components/background-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Beef,
  Loader2,
  Mic,
  Milk,
  Utensils,
  Wheat,
} from 'lucide-react';

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
  const [foods, setFoods] = useState<ScannedFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchFoodHistory = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(
          'https://api.scaneats.app/api/Food/references',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFoods(data);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to fetch meal history.',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not connect to the server.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodHistory();
  }, [router, toast]);

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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="abstract food pattern"
        className="blur-sm"
      />
      <div className="z-10 flex h-screen w-full flex-col items-center overflow-y-auto p-4 pb-28">
        <header className="mb-4 flex w-full max-w-lg items-center justify-between self-start">
          <Image
            src="/scaneats-logo.svg"
            alt="ScanEats Logo"
            width={120}
            height={60}
          />
        </header>

        <section className="my-4 text-center">
          <div className="text-5xl font-bold text-white [text-shadow:_0_0_10px_white]">
            {totals.calories.toFixed(0)}
          </div>
          <div className="mt-2 inline-block rounded-full bg-black/50 px-3 py-1 text-sm text-gray-200">
            Total Calories Today
          </div>
        </section>

        <section className="mb-8 flex w-full max-w-md flex-wrap justify-center gap-4">
          <MacroCard label="Protein" value={`${totals.protein.toFixed(0)}g`} icon={Beef} />
          <MacroCard label="Fat" value={`${totals.fat.toFixed(0)}g`} icon={Milk} />
          <MacroCard label="Carbs" value={`${totals.carbs.toFixed(0)}g`} icon={Wheat} />
        </section>

        <Card className="w-full max-w-md border-primary/50 bg-background/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Utensils className="h-5 w-5" />
              Meal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {foods.length > 0 ? (
              <ul className="space-y-3">
                {foods.map((food) => (
                  <li
                    key={food.id}
                    className="flex justify-between rounded-md bg-black/30 p-3 text-white"
                  >
                    <span>{food.name}</span>
                    <span>{food.calories.toFixed(0)} kcal</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">
                No meals scanned yet.
              </p>
            )}
          </CardContent>
        </Card>

        <section className="mt-auto flex flex-col items-center gap-4 pt-8 pb-4">
          <Link
            href="/dashboard/sally?intent=meal-plan"
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
