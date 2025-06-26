
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BackgroundImage } from '@/components/background-image';
import Image from 'next/image';

export default function ProfilePage() {
  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1200x800.png"
        data-ai-hint="abstract purple"
        className="blur-sm"
      />
      <main className="container z-10 mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <Image
            src="https://placehold.co/600x140.png"
            data-ai-hint="personal goals"
            alt="Personal Goals"
            width={600}
            height={140}
            className="mx-auto"
          />
        </div>

        <div className="rounded-lg bg-black/70 p-8 backdrop-blur-sm">
          <h2 className="mb-8 text-center font-headline text-3xl text-white">
            Create New Profile
          </h2>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">Name</Label>
              <Input id="name" placeholder="Your Name" className="rounded-full border-neutral-500 bg-black/80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="font-bold">Age</Label>
              <Input id="age" type="number" placeholder="Your Age" className="rounded-full border-neutral-500 bg-black/80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="font-bold">Gender</Label>
              <Input id="gender" placeholder="Your Gender" className="rounded-full border-neutral-500 bg-black/80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="font-bold">Weight (kg)</Label>
              <Input id="weight" type="number" placeholder="e.g., 70" className="rounded-full border-neutral-500 bg-black/80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals" className="font-bold">Goals</Label>
              <Input id="goals" placeholder="e.g., Lose 5kg, build muscle" className="rounded-full border-neutral-500 bg-black/80" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="font-bold">Birth Date</Label>
              <Input id="birthDate" type="date" className="rounded-full border-neutral-500 bg-black/80" />
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full bg-primary py-3 text-lg rounded-md shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)] transition-shadow duration-300 hover:shadow-[0_0_12px_6px_hsl(var(--primary)/0.8)]">
                Create Profile
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
