
'use client';

import {
  ChevronRight,
  LogOut,
  UserCircle,
  Lock,
  Trash2,
  Loader2,
  Wallet,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        <span className={cn('font-medium text-white', labelClassName)}>
          {label}
        </span>
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
      className={`block transition-colors ${
        onClick || href ? 'hover:bg-white/5' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {content}
    </Wrapper>
  );
};

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfileAndBalance = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ variant: 'destructive', title: 'Not Authenticated' });
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`https://api.scaneats.app/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setUserName(data[0].name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user's name", error);
      }

      try {
        const response = await fetch(
          `https://api.scaneats.app/api/credit/balance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCreditBalance(data.credits);
        } else {
          setCreditBalance(0);
        }
      } catch (error) {
        console.error('Failed to fetch credit balance', error);
        setCreditBalance(0);
      }
    };
    fetchProfileAndBalance();
  }, [router, toast]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem('authToken');

    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You are not logged in.',
      });
      setIsDeleting(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.scaneats.app/api/Auth/delete`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast({
          title: 'Account Deleted',
          description: 'Your account has been permanently deleted.',
        });
        handleLogout();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to delete account.' }));
        throw new Error(errorData.error || 'Failed to delete account.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please ensure your new passwords match.',
      });
      return;
    }
    if (!currentPassword || !newPassword) {
      toast({
        variant: 'destructive',
        title: 'Fields required',
        description: 'Please fill out all password fields.',
      });
      return;
    }

    setIsChangingPassword(true);

    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');

    if (!token || !userId || !email || !userName) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not verify user information. Please log in again.',
      });
      setIsChangingPassword(false);
      return;
    }

    const payload = {
      Id: userId,
      UserName: userName,
      NewEmail: email,
      CurrentPassword: currentPassword,
      NewPassword: newPassword,
    };

    try {
      const response = await fetch(
        `https://api.scaneats.app/api/Auth/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been updated successfully.',
        });
        setIsPasswordDialogOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

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
              <Dialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
              >
                <DialogTrigger asChild>
                  <div className="cursor-pointer">
                    <SettingsItem
                      icon={Lock}
                      label="Change Password"
                      action={
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      }
                    />
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new password below.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={handlePasswordChange}
                    className="space-y-4 py-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        Current Password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </form>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-black/70 backdrop-blur-md">
            <CardHeader className="p-4">
              <CardTitle className="text-lg text-white">Credits</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SettingsItem
                icon={Wallet}
                label="Current Balance"
                value={
                  creditBalance !== null
                    ? `${creditBalance} credits remaining`
                    : 'Loading...'
                }
              />
              <Separator className="bg-white/10" />
              <div className="p-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent"
                >
                  <Link href="/pricing">Buy More Credits</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="secondary"
              className="w-full bg-stone-700/80 py-2.5 text-base text-white hover:bg-stone-600/90"
              onClick={handleLogout}
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
                  <AlertDialogTitle>
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: 'destructive' })}
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
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
