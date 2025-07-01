
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
  gender: string;
  weight: number | string;
  goals: string;
  birthDate: Date | null;
};

// Initial empty state for the profile
const initialProfileState: Profile = {
  id: null,
  name: '',
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
        const response = await fetch(`https://api.scaneats.app/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile.');
        }

        const data = await response.json();
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
    if (date) {
      setProfile((prev) => ({ ...prev, birthDate: date }));
    }
    setIsDatePickerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile.birthDate) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select your birth date before saving.',
      });
      return;
    }

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

    const calculateAge = (birthDate: Date): number => {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const method = profile.id ? 'PUT' : 'POST';
    const url = profile.id
      ? `https://api.scaneats.app/api/profile/${profile.id}`
      : `https://api.scaneats.app/api/profile`;
      
    const profileData: any = {
      name: profile.name,
      gender: profile.gender,
      weight: String(profile.weight || ''),
      goals: profile.goals,
      birthDate: profile.birthDate ? profile.birthDate.toISOString() : null,
      age: calculateAge(profile.birthDate),
    };

    if (profile.id) {
      profileData.id = profile.id;
    }

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
            const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.'}));
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
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-black pb-40 pt-5">
      <div className="w-[90%] max-w-2xl rounded-lg bg-[#0e010f]/50 p-5">
        <div className="mb-8 flex justify-center">
            <Image
              src="/profile-goals-logo.png"
              alt="Profile & Personal Goals"
              width={140}
              height={140}
              className="max-h-[140px] w-auto max-w-full"
            />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <Label htmlFor="name" className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]">
                Name
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Your Name"
                className="w-full rounded-full border-2 border-[#555] bg-black px-4 py-3 text-base"
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="gender" className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]">
                Gender
              </Label>
              <Select value={profile.gender} onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full rounded-full border-2 border-[#555] bg-black px-4 py-3 text-base">
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
            
            <div className="form-group">
              <Label htmlFor="weight" className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                value={profile.weight}
                onChange={handleInputChange}
                placeholder="e.g., 70"
                className="w-full rounded-full border-2 border-[#555] bg-black px-4 py-3 text-base"
              />
            </div>

            <div className="form-group">
              <Label htmlFor="birthDate" className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]">
                Birth Date
              </Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start rounded-full border-2 border-[#555] bg-black px-4 py-3 text-left text-base font-normal hover:bg-black/80',
                      !profile.birthDate && 'text-gray-400'
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
                    selected={profile.birthDate ?? undefined}
                    onSelect={handleDateChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="form-group">
              <Label htmlFor="goals" className="mb-1.5 block font-bold transition-all hover:[text-shadow:0_0_10px_rgba(255,255,255,0.8)]">
                Body Goal
              </Label>
              <Textarea
                id="goals"
                value={profile.goals}
                onChange={handleInputChange}
                placeholder="e.g., Lose 5kg, build muscle, improve cardiovascular health..."
                className="min-h-[100px] w-full rounded-3xl border-2 border-[#555] bg-black px-4 py-3 text-base"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSaving || isLoading}
                className="w-full rounded-lg bg-[#7F00FF] py-3 text-lg font-bold text-white transition-all hover:bg-[#9300FF] hover:shadow-[0_0_12px_6px_rgba(127,0,255,0.8)] disabled:opacity-50"
                style={{
                  boxShadow: '0 0 8px 2px rgba(127, 0, 255, 0.6)'
                }}
              >
                {isSaving ? <Loader2 className="animate-spin" /> : 'Save Profile'}
              </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
