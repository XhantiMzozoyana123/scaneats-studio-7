
import { cn } from '@/lib/utils';

interface AuthBackgroundImageProps {
  className?: string;
}

export function AuthBackgroundImage({
  className,
}: AuthBackgroundImageProps) {
  return (
    <div className="fixed inset-0 -z-10">
      <video
        src="https://gallery.scaneats.app/images/LandingPageSignup&SigninPage.webm"
        className={cn('h-full w-full object-cover blur-md', className)}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
