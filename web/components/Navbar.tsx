'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/docs", label: "Docs" },
    { href: "/roadmap", label: "Roadmap" },
    { href: "https://github.com/Buddhsen-tripathi/openvscan", label: "GitHub", external: true }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-nav-background border-b border-border transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              {mounted ? (
                <Image
                  src="/logo.png"
                  alt="OpenVScan"
                  priority
                  width={36}
                  height={36}
                  className="transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300"
                />
              ) : (
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              )}
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                OpenVScan
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(({ href, label, external }) => (
                <Link
                  key={href}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="px-4 py-2 text-sm text-nav-text hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/signin"
                className="ml-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 text-sm font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-nav-text hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`flex flex-col md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-4 space-y-2 border-t border-border items-center">
              {navLinks.map(({ href, label, external }) => (
                <Link
                  key={href}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="block px-4 py-2 text-nav-text hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/signin"
                className="block mx-4 mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 text-sm font-medium text-center shadow-lg shadow-primary/30"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
