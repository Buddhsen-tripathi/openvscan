'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Grouping navigation links for better organization
  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/docs", label: "Docs" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              {mounted ? (
                <Image
                  src="/logo.png"
                  alt="OpenVScan"
                  priority
                  width={32}
                  height={32}
                  className="rounded-md"
                />
              ) : (
                <div className="w-8 h-8 bg-muted rounded-md" />
              )}
              <span className="text-xl font-semibold text-foreground">
                OpenVScan
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {/* Standard Links */}
              <div className="flex items-center gap-6">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Divider and Action Buttons */}
              <div className="flex items-center gap-4">
                <div className="w-px h-6 bg-border" />
                <Link
                  href="https://github.com/Buddhsen-tripathi/openvscan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Star on GitHub
                </Link>
                <Button asChild size="sm">
                  <Link href="/signin">Get Started</Link>
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="space-y-2">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                 <Link
                    href="https://github.com/Buddhsen-tripathi/openvscan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Star on GitHub
                  </Link>
                <div className="px-4 pt-2">
                  <Button asChild className="w-full">
                    <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
