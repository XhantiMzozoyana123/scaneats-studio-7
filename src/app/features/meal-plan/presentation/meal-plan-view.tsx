
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/app/shared/hooks/use-toast';
import { Loader2, Info, Sparkles } from 'lucide-react';
import { MealApiRepository } from '../data/meal-api.repository';
import { MealService } from '../application/meal.service';
import type { ScannedFood } from '@/app/domain/scanned-food';
import { useUserData } from '@/app/shared/context/user-data-context';
import { getMealInsight } from '@/ai/flows/meal-insight-flow';

const mealRepository = new MealApiRepository();
const mealService = new MealService(mealRepository);

const StatCard = ({ label, value, unit }: { label: string, value: string, unit: string }) => (
  <div className="flex flex-col items-center justify-center rounded-lg bg-zinc-800/50 p-4 shadow-md">
    <div className="text-3xl font-bold text-white">{value}</div>
    <div className="text-sm font-light text-gray-400">{label}</div>
    <div className="text-xs text-gray-500">{unit}</div>
  </div>
);

const MacroBreakdown = ({
  carbs,
  protein,
  fat,
}: {
  carbs: number;
  protein: number;
  fat: number;
}) => {
  const total = carbs + protein + fat;
  if (total === 0) return null;

  const carbPercent = Math.round((carbs / total) * 100);
  const proteinPercent = Math.round((protein / total) * 100);
  const fatPercent = 100 - carbPercent - proteinPercent; // To ensure it adds up to 100

  return (
    <div className="mt-4 flex w-full h-4 rounded-full overflow-hidden bg-zinc-700">
      <div
        className="bg-green-500"
        style={{ width: `${carbPercent}%` }}
        title={`Carbs: ${carbPercent}%`}
      />
      <div
        className="bg-red-500"
        style={{ width: `${proteinPercent}%` }}
        title={`Protein: ${proteinPercent}%`}
      />
      <div
        className="bg-yellow-500"
        style={{ width: `${fatPercent}%` }}
        title={`Fat: ${fatPercent}%`}
      />
    </div>
  );
};

export const MealPlanView = () => {
  const { toast } = useToast();
  const { profile } = useUserData();
  const [scannedFood, setScannedFood] = useState<ScannedFood | null>(null);
  const [isMealLoading, setIsMealLoading] = useState(true);
  const [insight, setInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  useEffect(() => {
    const fetchMealPlan = async () => {
      console.log('MealPlanView: useEffect triggered. Starting fetch.');
      setIsMealLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('MealPlanView: No auth token found.');
        toast({
          variant: 'destructive',
          title: 'Not Authenticated',
          description: 'Please log in to view your meal plan.',
        });
        setIsMealLoading(false);
        return;
      }

      try {
        console.log('MealPlanView: Calling mealService.getLastMealPlan...');
        const meal = await mealService.getLastMealPlan(token);
        console.log('MealPlanView: Fetched meal data:', meal);
        setScannedFood(meal);
      } catch (error: any) {
        console.error('MealPlanView: Error fetching meal plan:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load meal plan',
          description: error.message,
        });
      } finally {
        console.log('MealPlanView: Fetch finished. Setting isMealLoading to false.');
        setIsMealLoading(false);
      }
    };

    fetchMealPlan();
  }, [toast]);

  useEffect(() => {
    const fetchInsight = async () => {
      if (scannedFood && profile) {
        setIsInsightLoading(true);
            setInsight(null);
            try {
              const result = await getMealInsight({
                profile: profile,
                meal: {
                  id: scannedFood.id,
                  name: scannedFood.name,
                  total: scannedFood.Total,
                  protein: scannedFood.Protein,
                  fat: scannedFood.Fat,
                  carbs: scannedFood.Carbs,
                },
                userQuery: "What is a nutritional insight for this meal?",
              });
              setInsight(result);
            } catch (error) {
              console.error("Failed to get meal insight:", error);
              setInsight("Sorry, I couldn't generate an insight for this meal right now.");
            } finally {
              setIsInsightLoading(false);
            }
          }
        };

    fetchInsight();
  }, [scannedFood, profile]);

  const { totalCalories, totalProtein, totalCarbs, totalFat } = useMemo(() => {
    if (!scannedFood) {
      console.log('MealPlanView: useMemo - scannedFood is null, returning zero values.');
      return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
    }
    const calculated = {
          totalCalories: scannedFood.Total || 0,
          totalProtein: scannedFood.Protein || 0,
          totalCarbs: scannedFood.Carbs || 0,
          totalFat: scannedFood.Fat || 0,
        };
    console.log('MealPlanView: useMemo - calculated values:', calculated);
    return calculated;
  }, [scannedFood]);

  if (isMealLoading) {
    console.log('MealPlanView: Rendering loading state.');
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p>Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  if (!scannedFood) {
    console.log('MealPlanView: Rendering "No food scanned yet" state.');
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <Info className="h-12 w-12 text-primary" />
          <h2 className="text-xl font-bold">No food scanned yet.</h2>
          <p className="text-muted-foreground">Scan an item to get started!</p>
        </div>
      </div>
    );
  }

  console.log('MealPlanView: Rendering meal data.');
  return (
    <div className="h-full overflow-y-auto bg-zinc-950 text-white p-4 pb-28">
       <header className="sticky top-0 z-10 w-full p-4 mb-4">
        <div className="container mx-auto flex items-center justify-center">
          <h1 className="text-xl font-semibold">Your Last Meal</h1>
        </div>
      </header>

      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="frosted-card p-6">
          <h2 className="text-2xl font-bold text-primary mb-2">{scannedFood.name}</h2>
          <p className="font-headline text-4xl font-bold text-white">
            {totalCalories.toFixed(0)}
            <span className="text-lg font-light text-gray-400"> cal</span>
          </p>
          <MacroBreakdown carbs={totalCarbs} protein={totalProtein} fat={totalFat} />
           <div className="flex justify-center gap-2 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500"/>Carbs</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-500"/>Protein</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-yellow-500"/>Fat</span>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Carbs" value={totalCarbs.toFixed(1)} unit="grams" />
          <StatCard label="Protein" value={totalProtein.toFixed(1)} unit="grams" />
          <StatCard label="Fat" value={totalFat.toFixed(1)} unit="grams" />
        </div>

        <div className="frosted-card p-6">
           <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Nutritional Insights
            </h3>
            {isInsightLoading ? (
                 <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    Sally is analyzing your meal...
                 </div>
            ) : (
                <p className="text-sm text-gray-300 leading-relaxed">
                  {insight}
                </p>
            )}
        </div>
      </div>
    </div>
  );
};
