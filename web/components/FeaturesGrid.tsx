'use client';

import { motion } from 'framer-motion';
import { Bot, Combine, GitBranch, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: <Combine className="w-10 h-10 text-primary" />,
    title: 'Unified Open-Source Power',
    description:
      'Leverages a suite of battle-tested open-source scanners (like Semgrep, Gitleaks, and Trivy) under a single, unified interface.',
  },
  {
    icon: <Bot className="w-10 h-10 text-primary" />,
    title: 'AI-Driven Analysis',
    description:
      'Our AI engine intelligently analyzes scan results, filtering out false positives and prioritizing the most critical vulnerabilities that require your attention.',
  },
  {
    icon: <GitBranch className="w-10 h-10 text-primary" />,
    title: 'Seamless Git Workflow',
    description:
      'Integrates directly into your development workflow with automated scans on pull requests, providing feedback before code is merged.',
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-primary" />,
    title: 'Reliable Pre-Production Testing',
    description:
      'Catch security issues early in the development lifecycle, reducing risk and ensuring you ship more secure code, faster.',
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="relative py-24 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Smarter, Faster <span className="text-primary">Security Testing</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            OpenVScan combines the best open-source tools with intelligent automation to secure your
            code before it ever reaches production.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/50 hover:bg-accent relative overflow-hidden shadow-sm hover:shadow-md">
                <div className="absolute top-0 left-0 h-full w-full bg-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-0"></div>
                <div className="relative mb-4">
                  <div className="flex-shrink-0 p-3 bg-muted border border-border rounded-lg w-16 h-16 flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
