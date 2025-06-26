'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import {
  type FoodScanNutritionOutput,
} from '@/ai/flows/food-scan-nutrition';
import {
  type PersonalizedDietarySuggestionsOutput,
} from '@/ai/flows/personalized-dietary-suggestions';
import {
  type GetMealInsightsOutput,
} from '@/ai/flows/meal-insights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Upload,
  Sparkles,
  Utensils,
  Wheat,
  Beef,
  Milk,
  HeartPulse,
  ShieldAlert,
} from 'lucide-react';
import { BackgroundImage } from '@/components/background-image';
import { useToast } from '@/hooks/use-toast';

type AnalysisResult = {
  nutrition: FoodScanNutritionOutput;
  insights?: GetMealInsightsOutput;
  suggestions?: PersonalizedDietarySuggestionsOutput;
};

export default function ScanFoodPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dietaryInfo, setDietaryInfo] = useState({
    goals: '',
    preferences: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Simulate Genkit analysis with mock data for UI design
    setTimeout(() => {
      const mockNutritionResult: FoodScanNutritionOutput = {
        foodIdentification: {
          name: 'Delicious Mock Meal',
          confidence: 0.95,
        },
        nutritionInformation: {
          calories: 450,
          protein: 25,
          fat: 20,
          carbohydrates: 40,
          allergens: ['Gluten', 'Dairy'],
        },
      };

      const mockInsightsResult: GetMealInsightsOutput = {
        calories: 450,
        protein: 25,
        fat: 20,
        carbs: 40,
        ingredients: 'Mock bread, mock cheese, mock tomato sauce',
        allergens: 'Gluten, Dairy',
        healthBenefits: 'Provides a good balance of macronutrients for sustained energy. Rich in mock-lycopene.',
        potentialRisks: 'High in sodium and saturated fat. Not suitable for individuals with gluten or lactose intolerance.',
      };

      const mockSuggestionsResult: PersonalizedDietarySuggestionsOutput = {
        suggestions: `This meal fits well into a balanced diet. Consider pairing it with a side salad to increase your vegetable intake. Based on your goal of "${dietaryInfo.goals || 'general health'}", this is a good choice.`,
      };

      setResult({
        nutrition: mockNutritionResult,
        insights: mockInsightsResult,
        suggestions: mockSuggestionsResult,
      });

      toast({
          title: 'Meal Saved (Mock)',
          description: 'This meal has been added to your history for design review.',
      });

      setIsLoading(false);
    }, 1500);
  };

  const MacroCard = ({
    label,
    value,
    unit,
    icon: Icon,
  }: {
    label: string;
    value: number;
    unit: string;
    icon: React.ElementType;
  }) => (
    <div className="flex-1 rounded-xl bg-primary/80 p-4 text-center shadow-lg transition-transform hover:scale-105">
      <Icon className="mx-auto mb-2 h-8 w-8 text-accent" />
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-2xl font-bold">
        {value.toFixed(0)}
        <span className="text-base">{unit}</span>
      </div>
    </div>
  );

  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="food abstract"
        className="blur-md"
      />
      <main className="container z-10 mx-auto overflow-y-auto px-4 py-8 pb-28">
        {!result ? (
          <Card className="mx-auto max-w-lg border-primary bg-background/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl text-accent">
                <Utensils /> Scan Your Meal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-background/50 transition-colors hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-12 w-12" />
                    <p>Click to upload an image</p>
                    <p className="text-xs">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="space-y-2">
                <Textarea
                  placeholder="Your dietary goals (e.g., weight loss, muscle gain)"
                  value={dietaryInfo.goals}
                  onChange={(e) =>
                    setDietaryInfo({ ...dietaryInfo, goals: e.target.value })
                  }
                  className="border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
                />
                <Textarea
                  placeholder="Your preferences & restrictions (e.g., vegetarian, no nuts)"
                  value={dietaryInfo.preferences}
                  onChange={(e) =>
                    setDietaryInfo({ ...dietaryInfo, preferences: e.target.value })
                  }
                  className="border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
                />
              </div>

              {error && (
                <p className="text-center text-destructive">{error}</p>
              )}
              <Button
                onClick={handleAnalyze}
                disabled={isLoading || !file}
                className="w-full bg-primary py-6 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Analyze Meal'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <h1 className="text-center font-headline text-4xl font-bold text-accent">
              {result.nutrition.foodIdentification.name}
            </h1>

            <div className="text-center">
              <div className="text-7xl font-bold">
                {result.nutrition.nutritionInformation.calories.toFixed(0)}
              </div>
              <div className="inline-block rounded-full bg-stone-800/70 px-4 py-1 text-sm text-muted-foreground">
                Total Calories
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <MacroCard
                label="Protein"
                value={result.nutrition.nutritionInformation.protein}
                unit="g"
                icon={Beef}
              />
              <MacroCard
                label="Fat"
                value={result.nutrition.nutritionInformation.fat}
                unit="g"
                icon={Milk}
              />
              <MacroCard
                label="Carbs"
                value={result.nutrition.nutritionInformation.carbohydrates}
                unit="g"
                icon={Wheat}
              />
            </div>

            {result.insights && (
              <Card className="border-primary/50 bg-background/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <HeartPulse /> Health Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Health Benefits</h4>
                    <p className="text-muted-foreground">
                      {result.insights.healthBenefits}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Potential Risks</h4>
                    <p className="text-muted-foreground">
                      {result.insights.potentialRisks}
                    </p>
                  </div>
                  {result.nutrition.nutritionInformation.allergens.length >
                    0 && (
                    <div>
                      <h4 className="flex items-center gap-2 font-semibold">
                        <ShieldAlert /> Allergens
                      </h4>
                      <p className="text-muted-foreground">
                        {result.nutrition.nutritionInformation.allergens.join(
                          ', '
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {result.suggestions && (
              <Card className="border-primary/50 bg-background/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <Sparkles /> Sally&apos;s Advice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {result.suggestions.suggestions}
                  </p>
                </CardContent>
              </Card>
            )}

            <Button onClick={() => setResult(null)} className="w-full">
              Scan Another Meal
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
