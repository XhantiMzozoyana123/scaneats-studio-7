import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
            Back to Home
        </Link>
      </div>
      <div className="w-full max-w-md text-center">
        <Mail className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-6 font-headline text-4xl font-bold">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
            Have questions or need support? We're here to help!
        </p>
        <div className="mt-8">
          <p className="text-muted-foreground">The best way to reach us is by email:</p>
          <a
            href="mailto:support@scaneats.com"
            className="mt-2 inline-block rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            support@scaneats.com
          </a>
        </div>
      </div>
    </div>
  );
}
