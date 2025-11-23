'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Marquee } from '@/components/ui/Marquee';
import { SplitText, BlurText } from '@/components/ui/TextAnimations';
import SpotlightButton from '@/components/ui/SpotlightButton';
import ColorBends from '@/components/ui/ColorBends';
import { Shield, Zap, Code2, Lock, Terminal, Database } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 md:pt-32 pb-20 bg-background">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-40">
        <ColorBends />
      </div>

      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8 backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          Now in Public Beta
        </motion.div>

        <div className="mx-auto max-w-5xl mb-8">
          <SplitText
            text="Secure Your Code Before Production"
            className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] justify-center"
            delay={0.1}
          />
        </div>

        <BlurText
          text="OpenVScan combines open-source scanners with AI-assisted analysis for faster, more reliable pre-production testing. Find and fix vulnerabilities before they ship."
          className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12 leading-relaxed"
          delay={0.8}
          duration={1}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16 md:mb-24"
        >
          <SpotlightButton
            as={Link}
            href="/signin"
            className="bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
          >
            Start Free Scan
          </SpotlightButton>
          <SpotlightButton
            as={Link}
            href="https://github.com/Buddhsen-tripathi/openvscan"
            className="hover:bg-muted/10"
          >
            View on GitHub
          </SpotlightButton>
        </motion.div>
      </div>
    </section>
  );
}
