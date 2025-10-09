'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import Threads from './Threads';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background text-foreground">

      {/* WebGL Threads Background */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20">
        <Suspense fallback={<div className="w-full h-full bg-background" />}>
          <Threads
            color={[0.3, 0.5, 0.9]}
            amplitude={0.8}
            distance={0.2}
            enableMouseInteraction={true}
          />
        </Suspense>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(theme(colors.primary/0.03)_1px,transparent_1px),linear-gradient(90deg,theme(colors.primary/0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-grow flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-8 animate-fade-in mx-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Work in Progress
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-foreground animate-fade-in-up">
          Secure Your Code
          <br />
          <span className="text-primary">Before It Ships</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Combines proven open-source security scanners with AI-driven analysis for smarter, faster pre-production testing.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button asChild size="lg" className="shadow-lg shadow-primary/20">
            <Link href="/signin">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="https://github.com/Buddhsen-tripathi/openvscan" target="_blank" rel="noopener noreferrer">
              <Star className="w-4 h-4 mr-2" />
              Star on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}