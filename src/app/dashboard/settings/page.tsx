'use client';

import { ChevronRight, LogOut, Bell, UserCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { BackgroundImage } from '@/components/background-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const SettingsItem = ({
  icon: Icon,
  label,
  href,
  action,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  action?: React.ReactNode;
}) => {
  const content = (
    <div className="flex items-center p-4">
      <Icon className="mr-4 h-6 w-6 text-accent" />
      <span className="flex-1 font-medium text-white">{label}</span>
      {action || (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-colors hover:bg-white/5">
        {content}
      </Link>
    );
  }

  return <div className="transition-colors hover:bg-white/5">{content}</div>;
};

export default function SettingsPage() {
  return (
    <>
      <BackgroundImage
        src="https://placehold.co/1200x800.png"
        data-ai-hint="abstract purple"
        className="blur-sm"
      />
      <main className="container z-10 mx-auto max-w-md px-4 py-8">
        <h1 className="mb-6 text-center font-headline text-4xl font-bold text-white">
          Settings
        </h1>
        <Card className="border-primary/30 bg-black/70 backdrop-blur-md">
          <CardContent className="p-0">
            <SettingsItem
              icon={UserCircle}
              label="Profile & Personal Goals"
              href="/dashboard/profile"
            />
            <Separator className="bg-white/10" />
            <SettingsItem
              icon={Bell}
              label="Push Notifications"
              action={<Switch id="notifications-switch" />}
            />
            <Separator className="bg-white/10" />
            <SettingsItem
              icon={Star}
              label="Subscription"
              href="/pricing"
            />
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="destructive" className="w-full bg-red-800/80 py-6 text-base font-semibold text-white hover:bg-red-700/90">
            <LogOut className="mr-2 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </main>
    </>
  );
}
