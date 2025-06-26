'use client';

import Image from 'next/image';
import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
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
  goals: string;
  birthDate: Date | null;
};

// Initial empty state for the profile
const initialProfileState: Profile = {
  id: null,
  name: '',
  age: '',
  gender: 'Prefer not to say',
  weight: '',
  goals: '',
  birthDate: null,
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>(initialProfileState);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For initial fetch

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'You must be logged in to view your profile.',
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile.');
        }

        const data: Profile[] = await response.json();
        // The API returns a list of profiles, we'll use the first one.
        if (data && data.length > 0) {
          const userProfile = data[0];
          setProfile({
            ...userProfile,
            birthDate: userProfile.birthDate ? new Date(userProfile.birthDate) : null,
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch your profile. You can create one by saving this form.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);


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
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to save your profile.',
        });
        setIsSaving(false);
        return;
    }

    const method = profile.id ? 'PUT' : 'POST';
    const url = profile.id 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/profile/${profile.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/profile`;
      
    // Prepare data for the API
    const profileData = {
      ...profile,
      age: parseInt(profile.age as string, 10) || 0,
      weight: profile.weight.toString(),
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
        });

        if (response.ok) {
            toast({
              title: 'Success',
              description: 'Your profile has been saved successfully.',
            });

            if(method === 'POST') {
              const newProfile = await response.json();
              setProfile({
                ...newProfile,
                birthDate: newProfile.birthDate ? new Date(newProfile.birthDate) : null,
              });
            }
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save profile.');
        }

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
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
      <main className="container z-10 mx-auto h-full max-w-md overflow-y-auto px-4 pb-28 pt-0">
        <div className="rounded-b-2xl bg-black/70 px-4 pb-4 pt-4 backdrop-blur-md">
          <div className="mb-4 flex justify-center">
            <Image
              src="/profile-goals-logo.png"
              alt="Profile & Personal Goals"
              width={60}
              height={60}
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
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

            <div className="space-y-1">
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

            <div className="space-y-1">
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

            <div className="space-y-1">
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

            <div className="space-y-1">
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

            <div className="space-y-1">
              <Label htmlFor="goals" className="font-semibold text-gray-300">
                Body Goal
              </Label>
              <Textarea
                id="goals"
                value={profile.goals}
                onChange={handleInputChange}
                placeholder="e.g., Lose 5kg, build muscle, improve cardiovascular health..."
                className="min-h-[100px] border-neutral-600 bg-black/50 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSaving || isLoading}
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
