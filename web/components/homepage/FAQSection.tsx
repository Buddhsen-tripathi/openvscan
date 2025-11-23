'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does the AI analysis work?',
    answer:
      'Our AI engine is trained on millions of security vulnerabilities and code patterns. It analyzes the raw output from open-source scanners to filter out false positives, prioritize critical issues, and provide context-aware remediation suggestions.',
  },
  {
    question: 'Can I use OpenVScan for private repositories?',
    answer:
      'Yes! OpenVScan supports both public and private repositories on GitHub and GitLab. We use secure OAuth integration to access your code only when necessary for scanning.',
  },
  {
    question: 'What languages and frameworks are supported?',
    answer:
      'We support a wide range of languages including JavaScript/TypeScript, Python, Java, Go, Ruby, PHP, and more. We also have specialized scanners for frameworks like React, Next.js, Django, Spring Boot, etc.',
  },
  {
    question: 'Is OpenVScan free to use?',
    answer:
      'OpenVScan is open-source and free to self-host. We also offer a managed cloud version with a free tier for individual developers and open-source projects.',
  },
  {
    question: 'How do I integrate OpenVScan into my CI/CD pipeline?',
    answer:
      'We provide a CLI tool and ready-to-use actions/plugins for GitHub Actions, GitLab CI, Jenkins, and other popular CI/CD platforms. You can set it up in minutes.',
  },
];

export default function FAQSection() {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Frequently Asked
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
              {' '}
              Questions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">Got questions? We&apos;ve got answers.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-primary/10 bg-primary/5 rounded-xl px-4 data-[state=open]:bg-primary/10 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg font-medium hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
