
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Wallet, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundImage } from '@/components/background-image';

type CreditProduct = {
  id: number;
  credit: number;
  price: number;
  description: string;
};

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<CreditProduct[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({ variant: 'destructive', title: 'Authentication Error' });
        router.push('/login');
        return;
      }

      try {
        // Fetch credit products
        const productsResponse = await fetch(`https://api.scaneats.app/api/credit/shop`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!productsResponse.ok) throw new Error('Failed to fetch credit shop.');
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Fetch credit balance
        const balanceResponse = await fetch(`https://api.scaneats.app/api/credit/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!balanceResponse.ok) throw new Error('Failed to fetch credit balance.');
        const balanceData = await balanceResponse.json();
        setBalance(balanceData.credits);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [router, toast]);

  const handlePurchase = async (product: CreditProduct) => {
    setIsPurchasing(product.id);
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');

    if (!token || !email) {
      toast({ variant: 'destructive', title: 'Error', description: 'User information not found. Please log in again.' });
      setIsPurchasing(null);
      return;
    }

    try {
      const response = await fetch(`https://api.scaneats.app/api/credit/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
          creditInformation: product,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Purchase failed.');
      }
      
      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Payment URL not received.');
      }

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Purchase Error', description: error.message });
      setIsPurchasing(null);
    }
  };
  
  const handleSubscribe = async () => {
    setIsSubscribing(true);
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');

    if (!token || !email) {
      toast({ variant: 'destructive', title: 'Error', description: 'User information not found. Please log in again.' });
      setIsSubscribing(false);
      return;
    }

    // NOTE: Replace this with your actual Paystack plan code.
    const subscriptionPlanCode = 'PLN_xxxxxxxxxxxxxxx'; 

    try {
      const response = await fetch(`https://api.scaneats.app/api/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
          plan: subscriptionPlanCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Subscription failed.');
      }
      
      const result = await response.json();
      if (result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        throw new Error('Payment URL not received.');
      }

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Subscription Error', description: error.message });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      <BackgroundImage src="https://placehold.co/1200x800.png" data-ai-hint="abstract purple" className="blur-sm" />
      <div className="relative z-10 flex min-h-screen flex-col items-center p-6 text-white">
        <div className="w-full max-w-4xl">
          <Button asChild variant="ghost" className="absolute top-6 left-6 text-white hover:bg-white/10 hover:text-white">
            <Link href="/dashboard/settings">
              <ArrowLeft className="mr-2" /> Back to Settings
            </Link>
          </Button>

          <header className="mb-8 pt-20 text-center">
            <h1 className="font-headline text-4xl font-bold text-white md:text-5xl">Plans & Pricing</h1>
            <p className="mt-2 text-lg text-muted-foreground">Choose the plan that's right for you.</p>
            {balance !== null && (
              <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/20 px-6 py-3 text-center text-white shadow-lg shadow-primary/20">
                <Wallet className="h-7 w-7 text-accent" />
                <div>
                  <div className="text-sm font-normal text-accent">Your Balance</div>
                  <div className="text-2xl font-semibold">{balance} Credits</div>
                </div>
              </div>
            )}
          </header>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-16 w-16 animate-spin text-white" />
            </div>
          ) : (
            <div className="space-y-8">
              <Card className="w-full border-2 border-primary bg-primary/10 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">Monthly Subscription</CardTitle>
                  <CardDescription className="text-lg text-primary-foreground">Get the best value and never run out of credits.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-left md:flex-row md:items-center">
                    <div className="flex-1">
                       <p className="text-4xl font-bold text-white">$9.99 <span className="text-base font-normal text-muted-foreground">/ month</span></p>
                       <ul className="mt-4 space-y-2 text-muted-foreground">
                          <li className="flex items-center gap-2"><Check className="h-5 w-5 text-accent" /> <strong>50 Credits</strong> delivered monthly</li>
                          <li className="flex items-center gap-2"><Check className="h-5 w-5 text-accent" /> Full access to all AI features</li>
                          <li className="flex items-center gap-2"><Check className="h-5 w-5 text-accent" /> Cancel anytime</li>
                       </ul>
                    </div>
                    <div className="flex items-center">
                      <Button 
                        onClick={handleSubscribe} 
                        disabled={isSubscribing}
                        size="lg"
                        className="w-full bg-primary py-6 text-lg font-bold shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)] transition-shadow duration-300 hover:shadow-[0_0_12px_6px_hsl(var(--primary)/0.8)] md:w-auto"
                      >
                        {isSubscribing ? <Loader2 className="animate-spin" /> : 'Subscribe Now'}
                      </Button>
                    </div>
                </CardContent>
              </Card>

              <div>
                <h2 className="mb-4 text-center font-headline text-3xl font-bold">Or, Top Up Your Credits</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card key={product.id} className="flex flex-col border-primary/30 bg-black/70 backdrop-blur-md transition-all hover:border-primary">
                      <CardHeader>
                        <CardTitle className="text-accent text-2xl">{product.credit} Credits</CardTitle>
                        <CardDescription>{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="text-4xl font-bold">
                          ${product.price.toFixed(2)}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={() => handlePurchase(product)} 
                          disabled={isPurchasing === product.id}
                          className="w-full bg-primary py-3 text-lg font-bold shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)] transition-shadow duration-300 hover:shadow-[0_0_12px_6px_hsl(var(--primary)/0.8)]"
                        >
                          {isPurchasing === product.id ? <Loader2 className="animate-spin" /> : 'Purchase'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
