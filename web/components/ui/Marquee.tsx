'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface MarqueeProps {
  items: React.ReactNode[];
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  variant?: 'text' | 'logo';
  className?: string;
}

export const Marquee = ({
  items,
  speed = 'normal',
  direction = 'left',
  variant = 'text',
  className,
}: MarqueeProps) => {
  const speedDuration = {
    slow: '60s',
    normal: '40s',
    fast: '20s',
  };

  return (
    <div className={cn('group relative flex overflow-hidden', className)}>
      <div
        style={{ '--marquee-duration': speedDuration[speed] } as React.CSSProperties}
        className={cn(
          'flex min-w-full shrink-0 gap-8 py-4 animate-marquee flex-nowrap items-center',
          direction === 'right' && 'animate-marquee-reverse',
        )}
      >
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-center mx-4">
            {item}
          </div>
        ))}
        {items.map((item, idx) => (
          <div key={`dup-${idx}`} className="flex items-center justify-center mx-4">
            {item}
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        style={{ '--marquee-duration': speedDuration[speed] } as React.CSSProperties}
        className={cn(
          'flex min-w-full shrink-0 gap-8 py-4 animate-marquee flex-nowrap items-center absolute top-0 left-0',
          direction === 'right' && 'animate-marquee-reverse',
        )}
      >
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-center mx-4">
            {item}
          </div>
        ))}
        {items.map((item, idx) => (
          <div key={`dup-${idx}`} className="flex items-center justify-center mx-4">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
