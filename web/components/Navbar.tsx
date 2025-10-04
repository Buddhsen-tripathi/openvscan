'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-nav-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {mounted && (
              <Image
                src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo.png'}
                alt="OpenVScan"
                width={36}
                height={36}
                className="transition-transform group-hover:scale-110"
              />
            )}
            {!mounted && (
              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            )}
            <span className="text-xl font-bold text-foreground">
              OpenVScan
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-sm text-nav-text hover:text-nav-text-hover transition-colors">
              Features
            </Link>
            <Link href="/docs" className="text-sm text-nav-text hover:text-nav-text-hover transition-colors">
              Docs
            </Link>
            <Link href="/roadmap" className="text-sm text-nav-text hover:text-nav-text-hover transition-colors">
              Roadmap
            </Link>
            <Link href="https://github.com/Buddhsen-tripathi/openvscan" target="_blank" rel="noopener noreferrer" className="text-sm text-nav-text hover:text-nav-text-hover transition-colors">
              GitHub
            </Link>

            <Link href="/get-started" className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-nav-text"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <Link href="/features" className="block text-nav-text hover:text-nav-text-hover transition-colors text-sm" onClick={() => setIsMenuOpen(false)}>
              Features
            </Link>
            <Link href="/docs" className="block text-nav-text hover:text-nav-text-hover transition-colors text-sm" onClick={() => setIsMenuOpen(false)}>
              Docs
            </Link>
            <Link href="/roadmap" className="block text-nav-text hover:text-nav-text-hover transition-colors text-sm" onClick={() => setIsMenuOpen(false)}>
              Roadmap
            </Link>
            <Link href="https://github.com/Buddhsen-tripathi/openvscan" target="_blank" rel="noopener noreferrer" className="block text-nav-text hover:text-nav-text-hover transition-colors text-sm" onClick={() => setIsMenuOpen(false)}>
              GitHub
            </Link>
            <Link href="/get-started" className="block px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium text-center" onClick={() => setIsMenuOpen(false)}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}