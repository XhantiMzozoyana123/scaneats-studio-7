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
  DialogDescription,
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
import { Separator } from '@/components/ui/separator';

const SettingsItem = ({
  icon: Icon,
  label,
  href,
  onClick,
  value,
  isDestructive,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  value?: string;
  isDestructive?: boolean;
}) => {
  const content = (
    <div
      onClick={onClick}
      className={`flex items-center p-4 transition-colors rounded-lg ${
        href || onClick ? 'cursor-pointer hover:bg-white/5' : ''
      }`}
    >
      <Icon
        className={`mr-4 h-5 w-5 ${
          isDestructive ? 'text-red-400' : 'text-gray-300'
        }`}
      />
      <div className="flex-1">
        <span
          className={`font-medium ${
            isDestructive ? 'text-red-400' : 'text-white'
          }`}
        >
          {label}
        </span>
        {value && <p className="text-sm text-gray-400">{value}</p>}
      </div>
      {(href || onClick) && !value && (
        <ChevronRight className="h-5 w-5 text-gray-500" />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
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
  const [subscriptionStatus, setSubscriptionStatus] = useState('loading'); // 'loading', 'active', 'inactive'
  const [isCancelling, setIsCancelling] = useState(false);
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
        const [profileRes, creditRes, subRes] = await Promise.all([
          fetch(`https://api.scaneats.app/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`https://api.scaneats.app/api/credit/balance`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`https://api.scaneats.app/api/subscription/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data && data.length > 0) setUserName(data[0].name);
        }
        if (creditRes.ok) {
          const data = await creditRes.json();
          setCreditBalance(data.credits);
        } else {
          setCreditBalance(0);
        }
        if (subRes.ok) {
          const data = await subRes.json();
          setSubscriptionStatus(data.isActive ? 'active' : 'inactive');
        } else {
          setSubscriptionStatus('inactive');
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your settings.',
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
    // ... rest of the password change logic ...
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

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in.',
      });
      setIsCancelling(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.scaneats.app/api/subscription/cancel`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast({
          title: 'Subscription Cancelled',
          description:
            'Your subscription will be cancelled at the end of your billing period.',
        });
        setSubscriptionStatus('inactive');
      } else {
        throw new Error('Failed to cancel subscription.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description: error.message,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-black p-5 text-gray-200">
      <Link
        href="/dashboard"
        className="absolute top-8 left-8 z-10 inline-block rounded-full border border-white/10 bg-zinc-800/60 py-2.5 px-4 text-sm font-medium text-white no-underline transition-colors hover:bg-zinc-700/80"
      >
        <div className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </div>
      </Link>

      <h1 className="main-title relative z-[1] mb-[-25px] text-center font-medium text-white text-[clamp(2.5rem,8vw,5rem)]">
        Settings
      </h1>

      <div className="pricing-card relative z-[2] w-full max-w-md gap-6 rounded-2xl border border-white/15 bg-[#2d2d2d]/45 p-8 text-left shadow-2xl backdrop-blur-[8px]">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        ) : (
          <>
            {/* Account Section */}
            <div>
              <h2 className="mb-2 px-4 text-sm font-semibold text-gray-400">
                ACCOUNT
              </h2>
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
                  <div className="w-full">
                    <SettingsItem icon={Lock} label="Change Password" onClick={() => {}} />
                  </div>
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

            <Separator className="bg-white/10" />

            {/* Subscription & Credits Section */}
            <div>
              <h2 className="mb-2 px-4 text-sm font-semibold text-gray-400">
                BILLING
              </h2>
              <SettingsItem
                icon={Repeat}
                label="Plan Status"
                value={
                  subscriptionStatus === 'loading'
                    ? 'Loading...'
                    : subscriptionStatus === 'active'
                    ? 'Active'
                    : 'Inactive'
                }
              />
              <SettingsItem
                icon={Wallet}
                label="Credit Balance"
                value={
                  creditBalance !== null
                    ? `${creditBalance} credits remaining`
                    : 'Loading...'
                }
              />
               <SettingsItem
                icon={CreditCard}
                label="Manage Billing"
                href="/pricing"
              />
            </div>

            <Separator className="bg-white/10" />

            {/* Actions Section */}
            <div>
              <SettingsItem icon={LogOut} label="Log Out" onClick={handleLogout} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div className="w-full">
                    <SettingsItem icon={Trash2} label="Delete Account" onClick={() => {}} isDestructive />
                  </div>
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
          </>
        )}
      </div>
    </div>
  );
}
