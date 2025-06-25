import { BackgroundImage } from '@/components/background-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

export default function MealPlanPage() {
  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1920x1080.png"
        data-ai-hint="meal plan food"
        className="blur-sm"
      />
      <main className="container z-10 mx-auto flex h-screen items-center justify-center px-4 py-8">
        <Card className="mx-auto max-w-2xl bg-background/70 text-center backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 font-headline text-3xl text-accent">
              <UtensilsCrossed /> Meal Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              Your personalized meal plan is coming soon!
            </p>
            <p className="mt-4">
              We&apos;ll help you schedule your meals, track your progress, and
              reach your goals effortlessly.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
