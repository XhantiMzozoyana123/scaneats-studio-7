'use client';

import Image from 'next/image';
import { useState, useEffect, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

type Profile = {
  id: number | null;
  name: string;
  age: number | string;
  gender: string;
  weight: number | string;
  height: number | string;
  goals: string;
  birthDate: Date | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    id: null,
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    goals: '',
    birthDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('https://api.scaneats.app/api/Profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const userProfile = data[0];
            setProfile({
              id: userProfile.id,
              name: userProfile.name || '',
              age: userProfile.age || '',
              gender: userProfile.gender || '',
              weight: userProfile.weight || '',
              height: userProfile.height || '', // Assuming height is part of the profile
              goals: userProfile.goals || '',
              birthDate: userProfile.birthDate
                ? parseISO(userProfile.birthDate)
                : null,
            });
          }
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to fetch profile data.',
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

    fetchProfile();
  }, [router, toast]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setProfile((prev) => ({ ...prev, gender: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setProfile((prev) => ({ ...prev, birthDate: date || null }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsSaving(false);
      router.push('/login');
      return;
    }

    const { id, ...profileData } = profile;
    const url = id
      ? `https://api.scaneats.app/api/Profile/${id}`
      : 'https://api.scaneats.app/api/Profile';
    const method = id ? 'PUT' : 'POST';

    // The API expects a specific structure, including fields that might not be in the form
    const payload = {
      ...profileData,
      id: id,
      age: Number(profileData.age) || 0,
      weight: String(profileData.weight), // API expects string for weight
      height: String(profileData.height), // Assuming height is handled as a string
      birthDate: profileData.birthDate?.toISOString(),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Your profile has been saved successfully.',
        });
        if (!id) {
          const newProfile = await response.json();
          setProfile((prev) => ({ ...prev, id: newProfile.id }));
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        src="https://placehold.co/1200x800.png"
        data-ai-hint="abstract purple"
        className="blur-sm"
      />
      <main className="container z-10 mx-auto max-w-md overflow-y-auto px-4 py-8 pb-28">
        <div className="rounded-2xl bg-black/70 p-6 backdrop-blur-md">
          <div className="mb-8 flex justify-center">
            <Image
              src="/profile-personal-goals.png"
              alt="Profile Personal Goals header"
              width={300}
              height={300}
              className="h-auto w-full max-w-[250px]"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-gray-300">
                Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={handleInputChange}
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
                value={profile.age}
                onChange={handleInputChange}
                placeholder="Your Age"
                className="border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="font-semibold text-gray-300">
                Gender
              </Label>
              <Select value={profile.gender} onValueChange={handleSelectChange}>
                <SelectTrigger className="border-neutral-600 bg-black/50 text-white">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">
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
                value={profile.weight}
                onChange={handleInputChange}
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
                value={profile.height}
                onChange={handleInputChange}
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
                      !profile.birthDate && 'text-gray-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {profile.birthDate ? (
                      format(profile.birthDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={profile.birthDate}
                    onSelect={handleDateChange}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
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
                value={profile.goals}
                onChange={handleInputChange}
                placeholder="e.g., Lose 5kg, build muscle, improve cardiovascular health..."
                className="min-h-[100px] border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                size="lg"
                disabled={isSaving}
                className="w-full rounded-md bg-primary py-3 text-lg font-bold shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)] transition-shadow duration-300 hover:shadow-[0_0_12px_6px_hsl(var(--primary)/0.8)] disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
