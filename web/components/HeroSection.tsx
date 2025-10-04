'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* === Hero Section === */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-secondary">
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            transform: `scale(${1 + scrollY * 0.0005}) rotate(${scrollY * 0.05}deg)`,
            opacity: Math.max(0.1, 1 - scrollY * 0.002)
          }}
        >
          <svg className="w-[800px] h-[800px]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.2" className="animate-pulse-slow" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.3" className="animate-pulse-slow" style={{ animationDelay: '1s' }} />
            <circle cx="100" cy="100" r="80" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="1" opacity="0.1"/>
            <path d="M40 100 a60 60 0 0 1 120 0" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round" className="animate-scan-arc" />
            <path d="M70 100 a30 30 0 0 1 60 0" fill="none" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" className="animate-scan-arc" style={{ animationDelay: '0.5s' }} />
            <circle cx="100" cy="100" r="4" fill="var(--color-primary)" className="animate-pulse-slow" />
          </svg>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(theme(colors.primary/0.03)_1px,transparent_1px),linear-gradient(90deg,theme(colors.primary/0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

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
            <span className="text-primary" style={{ WebkitTextStroke: '2px var(--color-foreground)', WebkitTextFillColor: 'currentColor' }}>
                Before It Ships
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Combines proven open-source security scanners with AI-driven analysis for smarter, faster pre-production testing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link href="/get-started" className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/50">
              Get Started
            </Link>
            <Link href="https://github.com/Buddhsen-tripathi/openvscan" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-card backdrop-blur-sm border border-border text-foreground rounded-lg font-semibold hover:bg-card-hover transition-all">
              View on GitHub →
            </Link>
          </div>
        </div>
      </section>

      {/*  Features Section  */}
      <section className="w-full bg-background flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-32">
        <div className="w-full max-w-3xl text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-6 text-foreground animate-fade-in-up">Why Use OpenVScan?</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            OpenVScan helps developers and security teams quickly detect vulnerabilities in their code before deployment.
            Combine multiple open-source security scanners with AI-driven analysis to get smarter, faster insights. 
            Whether you are scanning a personal project or a production repository, OpenVScan simplifies pre-production testing 
            and highlights critical security issues.
          </p>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Scan Your Code', desc: 'Upload your repository or connect your GitHub account to start scanning instantly.', link: '/scan-your-code' },
            { title: 'AI-Powered Insights', desc: 'Analyze scan results with AI that highlights true positives and reduces noise.', link: '/ai-insights' },
            { title: 'Integrate with CI/CD', desc: 'Easily integrate OpenVScan into your CI/CD pipeline for continuous security checks.', link: '/ci-cd-integration' },
          ].map((card, idx) => (
            <div
              key={idx}
              onClick={() => window.location.href = card.link}
              className="p-6 bg-card rounded-xl shadow hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer text-center hover:bg-gray-200"
            >
              <h3 className="text-xl font-semibold mb-4 text-primary">{card.title}</h3>
              <p className="text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

    {/*  Footer */}
<footer className="w-full bg-secondary text-muted-foreground py-12 mt-20">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between gap-12">
    
    
    <div className="flex flex-col items-start">
      <h2 className="text-2xl font-bold text-foreground hover:text-primary transition cursor-pointer mb-4">
        <Link href="/">OpenVScan</Link>
      </h2>
      <p className="text-sm text-gray-500 max-w-xs">
        OpenVScan helps developers detect vulnerabilities in code before deployment. 
        Combine multiple scanners with AI-driven analysis for smarter, faster security insights.
      </p>

      {/* Social Icons */}
      <div className="flex gap-4 mt-4">
        <Link href="https://github.com/Buddhsen-tripathi/openvscan" target="_blank" className="hover:text-primary transition">
          <FaGithub size={20} />
        </Link>
        <Link href="https://twitter.com" target="_blank" className="hover:text-primary transition">
          <FaTwitter size={20} />
        </Link>
        <Link href="https://linkedin.com" target="_blank" className="hover:text-primary transition">
          <FaLinkedin size={20} />
        </Link>
      </div>
    </div>

    {/* Footer Links */}
    <div className="flex flex-col sm:flex-row gap-12 justify-between w-full md:w-auto">

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
        <ul className="space-y-2 text-sm text-gray-500">
          <li><Link href="/about" className="hover:text-primary transition">About</Link></li>
          <li><Link href="/careers" className="hover:text-primary transition">Careers</Link></li>
          <li><Link href="/contact" className="hover:text-primary transition">Contact</Link></li>
          <li><Link href="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
          <li><Link href="/terms" className="hover:text-primary transition">Terms of Service</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
        <ul className="space-y-2 text-sm text-gray-500">
          <li><Link href="/docs" className="hover:text-primary transition">Documentation</Link></li>
          <li><Link href="/tutorials" className="hover:text-primary transition">Tutorials</Link></li>
          <li><Link href="/blog" className="hover:text-primary transition">Blog</Link></li>
          <li><Link href="/community" className="hover:text-primary transition">Community</Link></li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Products</h3>
        <ul className="space-y-2 text-sm text-gray-500">
          <li><Link href="/scan-your-code" className="hover:text-primary transition">Code Scanner</Link></li>
          <li><Link href="/ai-insights" className="hover:text-primary transition">AI Insights</Link></li>
          <li><Link href="/ci-cd-integration" className="hover:text-primary transition">CI/CD Integration</Link></li>
        </ul>
      </div>

    </div>
  </div>

  <div className="mt-12 text-center text-sm text-gray-500">
    &copy; {new Date().getFullYear()} OpenVScan. All rights reserved.
  </div>
</footer>
    </>
  );
}
