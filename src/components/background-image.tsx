import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BackgroundImageProps {
  src: string;
  className?: string;
  alt?: string;
  'data-ai-hint'?: string;
}

export function BackgroundImage({
  src,
  className,
  alt = 'Background',
  'data-ai-hint': aiHint,
}: BackgroundImageProps) {
  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={src}
        alt={alt}
        fill
        className={cn('object-cover', className)}
        quality={90}
        priority
        data-ai-hint={aiHint}
      />
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
