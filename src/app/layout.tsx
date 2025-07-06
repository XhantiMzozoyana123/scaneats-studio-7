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
  return (
    <html lang="en" className="dark">
      <body
        className={`${ptSans.variable} ${playfairDisplay.variable} font-body antialiased`}
      >
        <GoogleOAuthProvider clientId="944464077207-s4qkbo01fa6bteoarbjoro43dogsgokv.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
