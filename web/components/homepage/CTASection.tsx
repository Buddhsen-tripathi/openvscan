'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    const stats = [
        { value: "15K+", label: "Scans Completed" },
        { value: "30+", label: "Security Tools" },
        { value: "1.5K+", label: "Active Users" },
        { value: "99%", label: "Uptime" },
    ];

    return (
        <section className="relative py-28 px-4">
            <div className="absolute inset-0 bg-background"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_100%,#000_70%,transparent_110%)]"></div>
            
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative max-w-4xl mx-auto text-center"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Start Your <span className="text-primary">Security Journey</span> Today
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                    Join thousands of developers who rely on OpenVScan for critical security testing. Your next secure deployment is just a click away.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat, index) => (
                        <motion.div 
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-4 bg-card border border-border rounded-lg shadow-sm"
                        >
                            <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                            <div className="text-muted-foreground text-sm">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
                
                <Link href="/signin">
                    <motion.button
                        whileHover={{ y: -3, boxShadow: '0 10px 20px -5px rgba(112, 51, 255, 0.15)' }}
                        whileTap={{ y: 0 }}
                        className="group inline-flex items-center justify-center gap-2 w-auto h-14 px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-primary-foreground font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-primary/30"
                    >
                        Get Started for Free
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.button>
                </Link>
            </motion.div>
        </section>
    );
}
