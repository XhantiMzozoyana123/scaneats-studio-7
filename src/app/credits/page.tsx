'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
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

type CreditProduct = {
  id: number;
  credit: number;
  price: number;
  description: string;
};

const creditProducts: CreditProduct[] = [
    { id: 1, credit: 50, price: 4.99, description: 'Perfect for getting started.' },
    { id: 2, credit: 120, price: 9.99, description: 'Our most popular option.' },
    { id: 3, credit: 250, price: 19.99, description: 'Great value for regular users.' },
    { id: 4, credit: 550, price: 39.99, description: 'For the power user.' },
    { id: 5, credit: 1000, price: 69.99, description: 'Best value, never run out.' },
];

export default function CreditsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<CreditProduct[]>(creditProducts);
  const [isLoading, setIsLoading] = useState(false); // No longer loading from API
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);

  useEffect(() => {
    // Auth check remains important
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: "Please log in to purchase credits." });
      router.push('/login');
    }
  }, [router, toast]);

  const handlePurchase = async (product: CreditProduct) => {
    setIsPurchasing(product.id);
    const token = localStorage.getItem('authToken');
    const email = localStorage.getItem('userEmail');

    if (!token || !email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User information not found. Please log in again.',
      });
      setIsPurchasing(null);
      return;
    }

    try {
      const response = await fetch(
        `https://api.scaneats.app/api/credit/purchase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email,
            creditInformation: product,
          }),
        }
      );

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
      toast({
        variant: 'destructive',
        title: 'Purchase Error',
        description: error.message,
      });
      setIsPurchasing(null);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-black p-5 text-gray-200">
       <Link
        href="/dashboard/settings"
        className="absolute top-8 left-8 z-10 inline-block rounded-full border border-white/10 bg-zinc-800/60 py-2.5 px-4 text-sm font-medium text-white no-underline transition-colors hover:bg-zinc-700/80"
      >
        <div className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </div>
      </Link>

      <h1 className="main-title relative z-[1]">
        Buy Credits
      </h1>

      {isLoading ? (
          <div className="flex mt-5 h-96 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : (
         <div className="relative z-[2] mt-10 w-full max-w-4xl text-center">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {products.map((product) => (
                    <div key={product.id} className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-[#2d2d2d]/45 p-8 text-left shadow-xl backdrop-blur-[8px]">
                        <div className="flex-grow">
                            <div className="text-2xl font-semibold text-white">{product.credit} Credits</div>
                            <p className="mt-1 text-sm text-gray-400">{product.description}</p>
                        </div>
                        <div>
                             <div className="text-3xl font-bold text-white">${product.price.toFixed(2)}</div>
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <button
                                     disabled={isPurchasing !== null}
                                     className="cta-button mt-4 w-full"
                                  >
                                      {isPurchasing === product.id ? <Loader2 className="mx-auto animate-spin" /> : 'Purchase'}
                                  </button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                   <AlertDialogHeader>
                                       <AlertDialogTitle>Confirm Your Purchase</AlertDialogTitle>
                                       <AlertDialogDescription>
                                           You are about to make a one-time purchase of {product.credit} credits for ${product.price.toFixed(2)}.
                                       </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                       <AlertDialogCancel>Cancel</AlertDialogCancel>
                                       <AlertDialogAction onClick={() => handlePurchase(product)} disabled={isPurchasing !== null}>
                                           {isPurchasing === product.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                           Confirm & Pay
                                       </AlertDialogAction>
                                   </AlertDialogFooter>
                               </AlertDialogContent>
                           </AlertDialog>
                        </div>
                    </div>
                 ))}
             </div>
         </div>
      )}
    </div>
  );
}
