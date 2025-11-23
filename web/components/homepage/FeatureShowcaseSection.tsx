'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Shield,
  Zap,
  Search,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Bug,
  GitBranch,
  Package,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const scanningSteps = [
  {
    id: 1,
    title: 'Connect Repo / Upload Zip',
    description: 'Connect repository or upload zip file',
    icon: FileCode,
    status: 'completed',
    duration: '2s',
  },
  {
    id: 2,
    title: 'AI Analysis',
    description: 'AI scans for vulnerabilities',
    icon: Search,
    status: 'running',
    duration: '15s',
  },
  {
    id: 3,
    title: 'Dependency Check',
    description: 'Scan third-party packages',
    icon: Package,
    status: 'pending',
    duration: '8s',
  },
  {
    id: 4,
    title: 'Security Report',
    description: 'Generate detailed findings',
    icon: Shield,
    status: 'pending',
    duration: '5s',
  },
];

const mockResults = [
  { type: 'critical', count: 2, description: 'SQL Injection vulnerabilities' },
  { type: 'high', count: 5, description: 'Cross-site scripting issues' },
  { type: 'medium', count: 12, description: 'Insecure dependencies' },
  { type: 'low', count: 8, description: 'Code quality improvements' },
];

export default function FeatureShowcaseSection() {
  const [currentStep, setCurrentStep] = useState(2);
  const [isScanning, setIsScanning] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20" />;
    }
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <section className="py-24 px-4 bg-background relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            See It In
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
              {' '}
              Action
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how our AI-powered security scanner analyzes your code in real-time and provides
            actionable insights.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Scanning Process */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-background/50 backdrop-blur-xl border border-primary/10 rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-4 text-sm text-muted-foreground font-mono">Security Scanner</span>
            </div>

            <div className="space-y-4">
              {scanningSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  variants={itemVariants}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl transition-all border',
                    step.status === 'completed'
                      ? 'bg-green-500/5 border-green-500/20'
                      : step.status === 'running'
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-muted/30 border-transparent',
                  )}
                >
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.status === 'running' && (
                      <p className="text-xs text-primary mt-1 font-mono">Processing...</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <step.icon
                      className={cn(
                        'w-5 h-5',
                        step.status === 'completed'
                          ? 'text-green-500'
                          : step.status === 'running'
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                      )}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground font-mono">50%</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-primary to-accent-foreground h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Right Side - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Security Report</h3>
              <p className="text-muted-foreground mb-6">
                Comprehensive analysis results with actionable recommendations.
              </p>
            </div>

            <div className="space-y-4">
              {mockResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-4 rounded-xl border backdrop-blur-sm ${getSeverityColor(result.type)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium capitalize">{result.type}</span>
                    </div>
                    <span className="text-2xl font-bold">{result.count}</span>
                  </div>
                  <p className="text-sm opacity-90">{result.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold">AI Recommendations</h4>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use parameterized queries to prevent SQL injection</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Implement input validation for all user inputs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Update dependencies to latest secure versions</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
