'use client';

import { motion, Variants } from "framer-motion";
import { BrainCircuit, CheckCircle, Search, User, Database, Globe, Loader2, ArrowRight, FileText, ShieldCheck, Zap } from "lucide-react";

const getToolIcon = (type: string) => {
    switch (type) {
        case 'internal_service':
            return <Database className="w-3 h-3" />;
        case 'web_search':
            return <Globe className="w-3 h-3" />;
        default:
            return <Search className="w-3 h-3" />;
    }
};

const getToolColor = (type: string) => {
    switch (type) {
        case 'internal_service':
            return 'text-blue-600 bg-blue-100 border-blue-200';
        case 'web_search':
            return 'text-green-600 bg-green-100 border-green-200';
        default:
            return 'text-gray-600 bg-gray-100 border-gray-200';
    }
};

const toolsUsed = [
    { name: "Vulnerability Scanner", type: "internal_service" },
    { name: "Code Analysis", type: "web_search" },
    { name: "Dependency Check", type: "internal_service" },
];

export default function FeatureShowcaseSection() {
    const containerVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 1.5,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
    };

    const toolContainerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.5,
                staggerChildren: 0.3,
            }
        }
    };

    const toolItemVariants: Variants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
    };

    return (
        <section className="py-28 px-4 bg-background overflow-hidden">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={containerVariants}
                    className="bg-card border border-border rounded-xl p-4 lg:p-6 shadow-lg min-h-[450px]"
                >
                    <div className="h-8 bg-muted rounded-t-lg flex items-center px-4 border-b border-border">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-auto font-mono">Security Analysis</p>
                    </div>
                    <div className="p-4 lg:p-6 space-y-4">
                        {/* Animated File Upload */}
                        <motion.div 
                            variants={itemVariants} 
                            className="flex items-start gap-3 justify-end"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-primary p-3 rounded-lg w-fit max-w-sm">
                                <p className="text-primary-foreground font-mono text-sm">Please analyze my application code for security issues.</p>
                            </div>
                            <User className="h-7 w-7 text-muted-foreground mt-1 p-1 bg-muted rounded-full flex-shrink-0" />
                        </motion.div>

                        {/* Animated File Drop */}
                        <motion.div 
                            variants={itemVariants} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="relative">
                                <motion.div 
                                    className="h-7 w-7 text-primary mt-1 p-1 bg-primary/20 rounded-full flex-shrink-0"
                                    animate={{ 
                                        y: [0, -5, 0],
                                    }}
                                    transition={{ 
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                >
                                    <FileText className="h-5 w-5" />
                                </motion.div>
                            </div>
                            <div className="bg-muted border border-border rounded-lg w-full p-3 space-y-3">
                                <p className="text-foreground font-mono text-sm">Uploading application files...</p>
                                <div className="flex items-center gap-2">
                                    <motion.div 
                                        className="h-2 bg-primary rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Animated Analysis Process */}
                        <motion.div 
                            variants={itemVariants} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 1 }}
                        >
                            <BrainCircuit className="h-7 w-7 text-primary mt-1 p-1 bg-primary/20 rounded-full flex-shrink-0" />
                            <div className="bg-muted border border-border rounded-lg w-full p-3 space-y-3">
                                <p className="text-foreground font-mono text-sm">Analyzing code for vulnerabilities...</p>
                                <motion.div
                                    variants={toolContainerVariants}
                                    className="space-y-2"
                                >
                                    <p className="text-xs text-muted-foreground font-medium">Tools:</p>
                                    {toolsUsed.map((tool, index) => (
                                        <motion.div 
                                            key={tool.name} 
                                            variants={toolItemVariants} 
                                            className={`flex items-center gap-2 text-xs border rounded-md px-2 py-1 w-fit ${getToolColor(tool.type)}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 1.2 + index * 0.2 }}
                                        >
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            {getToolIcon(tool.type)}
                                            <span>Running {tool.name}...</span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Animated Report Generation */}
                        <motion.div 
                            variants={itemVariants} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 2.5 }}
                        >
                            <CheckCircle className="h-7 w-7 text-primary mt-1 p-1 bg-primary/20 rounded-full flex-shrink-0" />
                            <div className="bg-primary/10 border border-primary/30 rounded-lg w-full p-3">
                                <p className="text-foreground font-mono text-sm">Security analysis complete. Generating report...</p>
                                <div className="mt-3 border-t border-primary/30 pt-2 flex items-center gap-2 text-xs text-primary">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Report Generated</span>
                                </div>
                                
                                {/* Animated Report Preview */}
                                <motion.div 
                                    className="mt-3 p-2 bg-card border border-border rounded text-xs"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ duration: 0.5, delay: 3 }}
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium">Vulnerabilities:</span>
                                        <span className="text-red-600 font-bold">3 Critical</span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium">Security Issues:</span>
                                        <span className="text-orange-600 font-bold">7 High</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Best Practices:</span>
                                        <span className="text-yellow-600 font-bold">12 Medium</span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Automated <span className="text-primary">Security Analysis</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        Our AI-powered system automatically analyzes your code, runs comprehensive security scans, and generates detailed reports without any manual intervention.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="text-muted-foreground">Automatic file upload and processing</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="text-muted-foreground">Multi-tool security scanning</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="text-muted-foreground">Detailed vulnerability reports</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="text-muted-foreground">Actionable remediation guidance</span>
                        </div>
                    </div>
                    <div className="mt-10 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <span className="font-medium text-foreground">Enterprise-Grade Security</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Trusted by 1000+ organizations for automated security testing.</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
