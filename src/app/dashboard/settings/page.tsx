'use client';

import {
  ChevronRight,
  LogOut,
  Bell,
  UserCircle,
  CreditCard,
  Lock,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { BackgroundImage } from '@/components/background-image';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SettingsItem = ({
  icon: Icon,
  label,
  href,
  action,
  value,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  action?: React.ReactNode;
  value?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div className="flex items-center p-4">
      <Icon className="mr-4 h-6 w-6 text-accent" />
      <div className="flex-1">
        <span className="font-medium text-white">{label}</span>
        {value && <p className="text-sm text-muted-foreground">{value}</p>}
      </div>
      {action}
      {href && !action && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
    </div>
  );

  const Wrapper = href ? Link : 'div';

  return (
    <Wrapper
      {...(href ? { href } : {})}
      onClick={onClick}
      className={`block transition-colors ${onClick || href ? 'hover:bg-white/5' : ''} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {content}
    </Wrapper>
  );
};

export default function SettingsPage() {
  const subscriptionActive = true;
  const renewalDate = 'August 24, 2024';

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

        <Card className="mb-6 border-primary/30 bg-black/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Account</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SettingsItem
              icon={UserCircle}
              label="Profile & Personal Goals"
              href="/dashboard/profile"
            />
            <Separator className="bg-white/10" />
            <SettingsItem
              icon={Lock}
              label="Change Password"
              onClick={() => {}}
              action={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
            />
            <Separator className="bg-white/10" />
            <SettingsItem
              icon={Bell}
              label="Push Notifications"
              action={<Switch id="notifications-switch" />}
            />
          </CardContent>
        </Card>

        <Card className="mb-6 border-primary/30 bg-black/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SettingsItem
              icon={CreditCard}
              label={subscriptionActive ? 'Active' : 'Inactive'}
              value={
                subscriptionActive
                  ? `Renews on ${renewalDate}`
                  : 'Upgrade to unlock all features'
              }
            />
            <Separator className="bg-white/10" />
            <div className="p-4">
              <Button
                asChild
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent"
              >
                <Link href="/pricing">
                  {subscriptionActive ? 'Manage Subscription' : 'View Plans'}
                </Link>
              </Button>
            </div>
            {subscriptionActive && (
              <>
                <Separator className="bg-white/10" />
                <div className="p-4 pt-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 text-sm text-muted-foreground hover:bg-destructive/20 hover:text-red-400"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Button
            variant="secondary"
            className="w-full bg-stone-700/80 py-3 text-base text-white hover:bg-stone-600/90"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log Out
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full border border-red-500/50 bg-transparent text-red-500 hover:bg-red-900/50 hover:text-red-400"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={buttonVariants({ variant: 'destructive' })}
                >
                  Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </>
  );
}
