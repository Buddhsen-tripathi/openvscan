'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-secondary">
      {/* Animated SVG Background */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          transform: `scale(${1 + scrollY * 0.0005}) rotate(${scrollY * 0.05}deg)`,
          opacity: Math.max(0.1, 1 - scrollY * 0.002)
        }}
      >
        <svg
          className="w-[800px] h-[800px]"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rings and Arcs using primary color */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.2" className="animate-pulse-slow" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.3" className="animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <circle cx="100" cy="100" r="80" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="1" opacity="0.1"/>
          <path d="M40 100 a60 60 0 0 1 120 0" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round" className="animate-scan-arc" />
          <path d="M70 100 a30 30 0 0 1 60 0" fill="none" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" className="animate-scan-arc" style={{ animationDelay: '0.5s' }} />
          <circle cx="100" cy="100" r="4" fill="var(--color-primary)" className="animate-pulse-slow" />
        </svg>
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(theme(colors.primary/0.03)_1px,transparent_1px),linear-gradient(90deg,theme(colors.primary/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Work in Progress
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-foreground animate-fade-in-up">
          Secure Your Code
          <br />
        <span
            className="text-primary"
            style={{ WebkitTextStroke: '2px var(--color-foreground)', WebkitTextFillColor: 'currentColor' }}
        >
            Before It Ships
        </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Combines proven open-source security scanners with AI-driven analysis for smarter, faster pre-production testing.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link
            href="/get-started"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/50"
          >
            Get Started
          </Link>
          <Link
            href="https://github.com/Buddhsen-tripathi/openvscan"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-card backdrop-blur-sm border border-border text-foreground rounded-lg font-semibold hover:bg-card-hover transition-all"
          >
            View on GitHub →
          </Link>
        </div>
      </div>
    </section>
  );
}