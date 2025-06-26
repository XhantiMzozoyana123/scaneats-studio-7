'use client';

import {
  ChevronRight,
  LogOut,
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
import { cn } from '@/lib/utils';

const SettingsItem = ({
  icon: Icon,
  label,
  href,
  action,
  value,
  onClick,
  labelClassName,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  action?: React.ReactNode;
  value?: string;
  onClick?: () => void;
  labelClassName?: string;
}) => {
  const content = (
    <div className="flex items-center px-4 py-3">
      <Icon className="mr-4 h-5 w-5 text-accent" />
      <div className="flex-1">
        <span className={cn('font-medium text-white', labelClassName)}>{label}</span>
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
      <main className="container z-10 mx-auto max-w-md px-4 py-6">
        <h1 className="mb-4 text-center font-headline text-3xl font-bold text-white">
          Settings
        </h1>

        <div className="space-y-4">
          <Card className="border-primary/30 bg-black/70 backdrop-blur-md">
            <CardHeader className="p-4">
              <CardTitle className="text-lg text-white">Account</CardTitle>
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
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-black/70 backdrop-blur-md">
            <CardHeader className="p-4">
              <CardTitle className="text-lg text-white">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SettingsItem
                icon={CreditCard}
                label={subscriptionActive ? 'Active' : 'Inactive'}
                labelClassName={cn(
                  subscriptionActive 
                    ? "text-green-400 [text-shadow:0_0_8px_rgba(34,197,94,0.9)]"
                    : "text-red-400 [text-shadow:0_0_8px_rgba(239,68,68,0.9)]"
                )}
                value={
                  subscriptionActive
                    ? `Renews on ${renewalDate}`
                    : 'Upgrade to unlock all features'
                }
              />
              <Separator className="bg-white/10" />
              <div className="p-3">
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
                  <div className="px-3 pb-3">
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

          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="secondary"
              className="w-full bg-stone-700/80 py-2.5 text-base text-white hover:bg-stone-600/90"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Log Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full border border-red-500/50 bg-transparent py-2.5 text-red-500 hover:bg-red-900/50 hover:text-red-400"
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
        </div>
      </main>
    </>
  );
}
