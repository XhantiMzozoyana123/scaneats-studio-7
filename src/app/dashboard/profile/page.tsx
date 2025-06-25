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
        data-ai-hint="abstract gym"
        className="blur-sm"
      />
      <main className="container z-10 mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <Image
            src="https://placehold.co/800x200.png"
            data-ai-hint="profile banner"
            alt="Profile banner"
            width={400}
            height={100}
            className="mx-auto rounded-lg"
          />
        </div>

        <div className="rounded-lg bg-background/70 p-8 backdrop-blur-sm">
          <h2 className="mb-6 text-center font-headline text-3xl text-accent">
            Create/Update Your Profile
          </h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="Your Age" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" placeholder="Your Gender" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="e.g., 70" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">Goals</Label>
              <Input id="goals" placeholder="e.g., Lose 5kg, build muscle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input id="birthDate" type="date" />
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full bg-primary py-3 text-lg">
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
