'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Code2, Database, Eye, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
	{
		icon: Shield,
		title: 'AI-Powered Detection',
		description:
			'Advanced machine learning algorithms identify vulnerabilities with 99.9% accuracy.',
		color: 'text-blue-500',
		bgColor: 'bg-blue-500/10',
	},
	{
		icon: Zap,
		title: 'Real-Time Scanning',
		description:
			'Get instant security feedback as you write code with continuous monitoring.',
		color: 'text-green-500',
		bgColor: 'bg-green-500/10',
	},
	{
		icon: Code2,
		title: 'Multi-Language Support',
		description:
			'Comprehensive security analysis for JavaScript, Python, Go, Java, and more.',
		color: 'text-purple-500',
		bgColor: 'bg-purple-500/10',
	},
	{
		icon: Database,
		title: 'Dependency Security',
		description:
			'Scan your dependencies for known vulnerabilities and security issues.',
		color: 'text-orange-500',
		bgColor: 'bg-orange-500/10',
	},
	{
		icon: Eye,
		title: 'Deep Code Analysis',
		description:
			'Static analysis that goes beyond surface-level checks to find hidden issues.',
		color: 'text-pink-500',
		bgColor: 'bg-pink-500/10',
	},
	{
		icon: Lock,
		title: 'Compliance Ready',
		description:
			'Meet OWASP, PCI-DSS, and SOC2 requirements with automated compliance reports.',
		color: 'text-indigo-500',
		bgColor: 'bg-indigo-500/10',
	},
];

export default function FeatureSection() {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 },
		},
	};

	return (
		<section className="py-24 px-4 bg-background relative overflow-hidden">
			<div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

			<div className="max-w-7xl mx-auto relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
						Everything You Need for
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
							{' '}
							Security
						</span>
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Comprehensive security scanning with cutting-edge AI technology.
						Protect your applications from vulnerabilities before they become
						threats.
					</p>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{features.map((feature, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
							className="group relative bg-primary/5 border border-primary/10 rounded-2xl p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
						>
							<div
								className={cn(
									'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 group-hover:-translate-y-1 transition-transform duration-300',
									feature.bgColor,
									feature.color
								)}
							>
								<feature.icon className="w-6 h-6" />
							</div>

							<h3 className="text-xl font-semibold text-foreground mb-3">
								{feature.title}
							</h3>

							<p className="text-muted-foreground leading-relaxed">
								{feature.description}
							</p>

							<div className="absolute inset-0 border border-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
