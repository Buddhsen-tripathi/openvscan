"use client";

import { motion } from "framer-motion";
import Link from "@/components/AppLink";
import SpotlightButton from "@/components/ui/SpotlightButton";

const GITHUB_REPO = "https://github.com/Buddhsen-tripathi/openvscan";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/40 to-background" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <h2 className="mb-6 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          Ready to secure your code?
        </h2>

        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Open-source scanners and AI-assisted analysis — find and fix
          vulnerabilities before they ship.
        </p>

        <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
          <SpotlightButton
            as={Link}
            href="/signin"
            className="h-14 border-transparent bg-primary px-8 text-lg text-primary-foreground hover:bg-primary/90"
          >
            Get Started
          </SpotlightButton>
          <SpotlightButton
            as={Link}
            href={GITHUB_REPO}
            className="h-14 px-8 text-lg hover:bg-accent"
          >
            View on GitHub
          </SpotlightButton>
        </div>

        <p className="text-sm text-muted-foreground/70">
          Open source · AGPL-3.0 · self-host or run it hosted
        </p>
      </motion.div>
    </section>
  );
}
