'use client';

import {
  LogOut,
  UserCircle,
  Lock,
  Trash2,
  Loader2,
  Wallet,
  Repeat,
  ArrowLeft,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SettingsItem = ({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div
      onClick={onClick}
      className={`flex items-center p-4 transition-colors rounded-lg ${
        href || onClick ? 'cursor-pointer hover:bg-zinc-800' : ''
      }`}
    >
      <Icon className="mr-4 h-5 w-5 text-gray-300" />
      <span className="flex-1 font-medium text-white">{label}</span>
      {(href || onClick) && <ChevronRight className="h-5 w-5 text-gray-500" />}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

const DestructiveSettingsItem = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="flex cursor-pointer items-center p-4 transition-colors rounded-lg hover:bg-red-900/50"
  >
    <Icon className="mr-4 h-5 w-5 text-red-400" />
    <span className="flex-1 font-medium text-red-400">{label}</span>
  </div>
);

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ variant: 'destructive', title: 'Not Authenticated' });
        router.push('/login');
        return;
      }

      try {
        // Fetch profile and credits in parallel
        const [profileRes, creditRes] = await Promise.all([
            fetch(`https://api.scaneats.app/api/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`https://api.scaneats.app/api/credit/balance`, {
                headers: { Authorization: `Bearer ${token}` },
            })
        ]);
        
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data && data.length > 0) setUserName(data[0].name);
        }

        if (creditRes.ok) {
            const data = await creditRes.json();
            setCreditBalance(data.credits);
        } else {
            console.error('Failed to fetch credit balance');
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load your credit balance.',
            });
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your user information.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
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
      const response = await fetch(`https://api.scaneats.app/api/Auth/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: 'Account Deleted',
          description: 'Your account has been permanently deleted.',
        });
        handleLogout();
      } else {
        throw new Error('Failed to delete account.');
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
    <div className="flex min-h-screen flex-col bg-zinc-950 text-gray-200">
       <header className="sticky top-0 z-10 w-full bg-zinc-900/50 p-4 shadow-md backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: 'ghost' })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          <h1 className="text-xl font-semibold">Settings</h1>
          <div className="w-16" />
        </div>
      </header>
      <main className="w-full max-w-2xl flex-1 self-center p-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4 rounded-lg bg-zinc-900 p-6">
              <h2 className="text-lg font-semibold text-white">Account</h2>
              <SettingsItem
                icon={UserCircle}
                label="Profile & Personal Goals"
                href="/dashboard/profile"
              />
              <Dialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
              >
                <DialogTrigger asChild>
                  <button className="w-full">
                     <SettingsItem icon={Lock} label="Change Password" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handlePasswordChange}
                    className="space-y-4 py-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                  </form>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
                      {isChangingPassword ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4 rounded-lg bg-zinc-900 p-6">
                <h2 className="text-lg font-semibold text-white">Billing</h2>
                <div className="flex items-center p-4">
                  <Wallet className="mr-4 h-5 w-5 text-gray-300" />
                  <span className="flex-1 font-medium text-white">My Wallet</span>
                  <span className="font-semibold text-white">
                      {creditBalance !== null ? `${creditBalance} Credits` : <Loader2 className="h-4 w-4 animate-spin" />}
                  </span>
                </div>
               <SettingsItem
                icon={Repeat}
                label="Manage Subscription"
                href="/pricing"
              />
               <SettingsItem
                icon={CreditCard}
                label="Buy Credits"
                href="/credits"
              />
            </div>
            
            <div className="space-y-4 rounded-lg bg-zinc-900 p-6">
               <h2 className="text-lg font-semibold text-white">Actions</h2>
                <SettingsItem icon={LogOut} label="Log Out" onClick={handleLogout} />
                <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full">
                     <DestructiveSettingsItem icon={Trash2} label="Delete Account" onClick={() => {}} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} onClick={handleDeleteAccount} disabled={isDeleting}>
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
