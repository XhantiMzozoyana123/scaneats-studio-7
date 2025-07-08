import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft size={16} />
            Back to Home
        </Link>
        <h1 className="font-headline text-4xl font-bold mb-8">Privacy Policy for ScanEats</h1>
        <div className="space-y-6 prose prose-invert max-w-none text-muted-foreground">
          <p>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section>
            <h2 className="font-headline text-2xl font-bold mt-8 mb-4 text-foreground">1. Information We Collect</h2>
            <p>We may collect the following types of information when you use ScanEats:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Personal Information:</strong> Such as your name, email address, or phone number when you register or contact us.
              </li>
              <li>
                <strong>App Data:</strong> Food scan images, nutritional preferences, meal tracking and history.
              </li>
              <li>
                <strong>Device &amp; Usage Info:</strong> Such as your device type, operating system, browser, and usage behavior to improve the app experience.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-2xl font-bold mt-8 mb-4 text-foreground">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide and improve our services</li>
              <li>Personalize your experience</li>
              <li>Communicate with you (e.g., support or updates)</li>
              <li>Monitor and analyze usage trends</li>
              <li>Ensure security and prevent abuse</li>
            </ul>
          </section>
          
          <section>
            <h2 className="font-headline text-2xl font-bold mt-8 mb-4 text-foreground">3. Sharing Your Information</h2>
             <p>We do not sell your personal information. We may share data with:</p>
             <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Service providers who help us run the app (e.g., analytics, hosting)</li>
                <li>Authorities if required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-2xl font-bold mt-8 mb-4 text-foreground">4. Your Choices</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>You can update or delete your account information anytime.</li>
                <li>You can opt out of marketing emails by clicking "unsubscribe."</li>
                <li>You may request to delete your data by contacting us at <a href="mailto:support@scaneats.com" className="text-primary hover:underline">support@scaneats.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline text-2xl font-bold mt-8 mb-4 text-foreground">5. Security</h2>
            <p>We use standard security measures to protect your information, but no system is 100% secure. We encourage you to use strong passwords and keep your account information safe.</p>
          </section>

          <section>
            <h2 className="font-headline text-2xl font-bold mt-8 mb-4 text-foreground">6. Children’s Privacy</h2>
            <p>ScanEats is not intended for children under 13. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="font-headline text-2xl font-bold mt-8 mb-4 text-foreground">7. Changes to This Policy</h2>
            <p>We may update this policy from time to time. If we make significant changes, we’ll notify you through the app or by email.</p>
          </section>

          <section>
            <h2 className="font-headline text-2xl font-bold mt-8 mb-4 text-foreground">8. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
            <p><strong>Email:</strong> <a href="mailto:support@scaneats.com" className="text-primary hover:underline">support@scaneats.com</a></p>
            <p><strong>Website:</strong> <a href="https://www.scaneats.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.scaneats.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
