import type { Metadata } from 'next';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { PT_Sans, Playfair_Display } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ScanEats: Your AI Nutritionist',
  description:
    'Scan your food and get personalized nutrition advice with our AI-powered app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error("FATAL: Google Client ID is not defined in environment variables.");
    // You might want to render an error page or return null
    return (
       <html lang="en" className="dark">
        <body
          className={`${ptSans.variable} ${playfairDisplay.variable} font-body antialiased`}
        >
          <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
              <p className="text-muted-foreground">
                Google Client ID is missing. The application cannot start.
              </p>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" className="dark">
      <body
        className={`${ptSans.variable} ${playfairDisplay.variable} font-body antialiased`}
      >
        <GoogleOAuthProvider
          clientId={googleClientId}
        >
          {children}
          <Toaster />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
