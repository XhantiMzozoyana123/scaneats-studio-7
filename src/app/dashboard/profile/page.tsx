'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BackgroundImage } from '@/components/background-image';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const [date, setDate] = useState<Date>();

  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1200x800.png"
        data-ai-hint="abstract purple"
        className="blur-sm"
      />
      <main className="container z-10 mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl bg-black/70 p-6 backdrop-blur-md">
          <div className="mb-8 text-center">
            <h1 className="font-headline text-4xl font-bold text-white">
              Your Profile
            </h1>
            <p className="text-muted-foreground">
              Update your personal details and goals.
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-gray-300">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Your Name"
                className="border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="font-semibold text-gray-300">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Your Age"
                className="border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="font-semibold text-gray-300">
                Gender
              </Label>
              <Select>
                <SelectTrigger className="border-neutral-600 bg-black/50 text-white">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="font-semibold text-gray-300">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 70"
                className="border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="font-semibold text-gray-300">
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="e.g., 175"
                className="border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="birthDate"
                className="font-semibold text-gray-300"
              >
                Birth Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal border-neutral-600 bg-black/50 text-white hover:bg-black/40 hover:text-white',
                      !date && 'text-gray-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals" className="font-semibold text-gray-300">
                Goals
              </Label>
              <Textarea
                id="goals"
                placeholder="e.g., Lose 5kg, build muscle, improve cardiovascular health..."
                className="min-h-[100px] border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary py-3 text-lg font-bold rounded-md shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)] transition-shadow duration-300 hover:shadow-[0_0_12px_6px_hsl(var(--primary)/0.8)]"
              >
                Update Profile
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
