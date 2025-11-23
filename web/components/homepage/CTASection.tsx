'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import SpotlightButton from '@/components/ui/SpotlightButton';
import { ArrowRight, Shield, Users, Star, Zap } from 'lucide-react';

export default function CTASection() {
  const stats = [
    { value: "50K+", label: "Scans Completed", icon: <Shield size={24} /> },
    { value: "1M+", label: "Vulnerabilities Found", icon: <Zap size={24} /> },
    { value: "5K+", label: "Active Users", icon: <Users size={24} /> },
    { value: "99.9%", label: "Accuracy Rate", icon: <Star size={24} /> },
  ];

  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative max-w-4xl mx-auto text-center z-10"
      >
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
          Ready to Secure Your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground"> Code?</span>
        </h2>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of developers who trust our AI-powered security scanner to protect their applications.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <SpotlightButton as={Link} href="/signin" className="bg-primary text-primary-foreground hover:bg-primary/90 border-transparent h-14 px-8 text-lg">
            Get Started
          </SpotlightButton>
          <SpotlightButton as={Link} href="/demo" className="hover:bg-muted/10 h-14 px-8 text-lg">
            View Demo
          </SpotlightButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:-translate-y-1 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 inline-flex items-center gap-8 px-8 py-4 bg-primary/5 border border-primary/10 rounded-full backdrop-blur-sm"
        >
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trusted by developers at</span>
          <div className="flex items-center gap-6 text-sm font-semibold text-foreground/80">
            <span>Startups</span>
            <span className="w-1 h-1 rounded-full bg-primary/50" />
            <span>Enterprises</span>
            <span className="w-1 h-1 rounded-full bg-primary/50" />
            <span>Open Source</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
