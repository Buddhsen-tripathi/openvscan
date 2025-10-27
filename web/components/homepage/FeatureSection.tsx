'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, ShieldCheck, Code, Search, Zap } from 'lucide-react';

const availableTools = [
  {
    name: 'Vulnerability Scanner',
    path: '/tools/vulnerability',
    description: 'Scan your code for security vulnerabilities before deployment.',
    icon: <ShieldCheck className="w-6 h-6" />
  },
  {
    name: 'Code Analysis',
    path: '/tools/code-analysis',
    description: 'Deep analysis of your code for potential issues and improvements.',
    icon: <Code className="w-6 h-6" />
  },
  {
    name: 'Dependency Check',
    path: '/tools/dependency',
    description: 'Check your project dependencies for known security issues.',
    icon: <Search className="w-6 h-6" />
  },
  {
    name: 'Performance Audit',
    path: '/tools/performance',
    description: 'Audit your application for performance bottlenecks.',
    icon: <Zap className="w-6 h-6" />
  }
];

function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
}

export default function FeatureSection() {
  const [featuredTools, setFeaturedTools] = useState<typeof availableTools>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const shuffledTools = shuffleArray(availableTools);
    if (shuffledTools && shuffledTools.length > 0) {
      const selectedTools = shuffledTools.slice(0, 4);
      setFeaturedTools(selectedTools);
    } else {
      console.error('availableTools is empty or undefined.');
    }
    setIsLoading(false);
  }, []);

  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0
    },
    onscreen: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as any,
        bounce: 0.4,
        duration: 0.8,
        delay: i * 0.1
      }
    })
  };

  return (
    <section className="relative py-28 px-4 bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className='text-primary'>Featured </span>Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Access our frequently used tools for quick and efficient investigations.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center text-muted-foreground py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredTools.map((tool, index) => (
              <motion.div
                key={tool.path || index}
                custom={index}
                variants={cardVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.4 }}
              >
                <Link href={tool.path || '#'} className="block h-full">
                  <div className="group h-full bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/50 hover:bg-accent relative overflow-hidden shadow-sm hover:shadow-md">
                    <div className="absolute top-0 left-0 h-full w-full bg-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-0"></div>
                    <div className="relative">
                      <div className="mb-6 bg-muted border border-border rounded-lg w-12 h-12 flex items-center justify-center">
                        {tool.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {tool.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link href="/tools">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="group inline-flex items-center justify-center w-48 h-14 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-primary-foreground font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/30"
              >
                <span className="text-lg">Explore All Tools</span>
                <ArrowRight className="ml-1 mt-1 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
