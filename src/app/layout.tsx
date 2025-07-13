
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
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    // Throw an error during the build process if the Google Client ID is missing.
    // This will cause the Vercel build to fail with a clear message,
    // which is better than deploying a broken app that returns 404s.
    throw new Error("FATAL: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in environment variables. Build failed.");
  }

  return (
    <html lang="en" className="dark">
      <head>
         <meta name="theme-color" content="#1D122F" />
         <link rel="icon" href="https://gallery.scaneats.app/images/ScanEatsLogo.png" type="image/png" />
         <link rel="apple-touch-icon" href="https://gallery.scaneats.app/images/ScanEatsLogo_192.png"></link>
      </head>
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
