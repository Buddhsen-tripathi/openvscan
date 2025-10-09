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
    <section id="features" className="py-24 bg-muted/50 dark:bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Smarter, Faster Security Testing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            OpenVScan combines the best open-source tools with intelligent automation to secure your code before it ever reaches production.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-6 items-start">
              <div className="flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}