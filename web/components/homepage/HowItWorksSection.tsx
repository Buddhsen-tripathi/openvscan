'use client';

import { motion } from 'framer-motion';
import { GitBranch, Search, ShieldCheck, FileText } from 'lucide-react';

const steps = [
	{
		icon: GitBranch,
		title: 'Connect Repo or Upload Zip',
		description:
			'Link your GitHub or GitLab repository, or simply upload a zip file of your source code.',
	},
	{
		icon: Search,
		title: 'Run Scans',
		description:
			'Initiate a scan manually or set up automated scans on every pull request.',
	},
	{
		icon: ShieldCheck,
		title: 'AI Analysis',
		description:
			'Our AI engine analyzes the results, filtering out false positives and prioritizing critical issues.',
	},
	{
		icon: FileText,
		title: 'Get Report',
		description:
			'Receive a comprehensive report with actionable remediation steps to fix vulnerabilities.',
	},
];

export default function HowItWorksSection() {
	return (
		<section className="py-24 px-4 bg-background relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-foreground/10 rounded-full blur-[100px]" />
			</div>

			<div className="max-w-7xl mx-auto relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="text-center mb-20"
				>
					<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
						How OpenVScan
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
							{' '}
							Works
						</span>
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Secure your application in four simple steps. No complex
						configuration required.
					</p>
				</motion.div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
					{/* Connecting line for desktop */}
					<div className="hidden lg:block absolute top-12 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

					{steps.map((step, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.2 }}
							className="relative flex flex-col items-center text-center group"
						>
							<div className="w-24 h-24 rounded-2xl bg-background border border-primary/20 flex items-center justify-center mb-8 relative z-10 shadow-lg shadow-primary/20 group-hover:border-primary/50 transition-all duration-300 group-hover:-translate-y-1">
								<step.icon className="w-10 h-10 text-primary transition-colors duration-300" />
								<div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
									{index + 1}
								</div>
							</div>

							<h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
								{step.title}
							</h3>

							<p className="text-muted-foreground leading-relaxed">
								{step.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
