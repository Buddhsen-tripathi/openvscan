"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "@/components/AppImage";
import Link from "@/components/AppLink";
import { cn } from "@/lib/utils";
import { MenuIcon } from "./ui/Icons";

const GITHUB_REPO = "Buddhsen-tripathi/openvscan";

function formatStarCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((res) => res.json() as Promise<{ stargazers_count?: number }>)
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setStarCount(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header
      className={cn(
        "fixed top-6 left-0 right-0 z-50 mx-auto max-w-5xl transition-all duration-300",
        scrolled ? "px-4" : "px-0",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center justify-between rounded-full border px-6 backdrop-blur-xl transition-all",
          scrolled
            ? "border-border/50 bg-background/80 shadow-lg"
            : "border-transparent bg-transparent",
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="OpenVScan Logo"
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-foreground">
            OpenVScan
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Docs"].map((item) => (
            <Link
              key={item}
              href={
                item === "Docs"
                  ? "/docs"
                  : `/#${item.toLowerCase().replace(/\s+/g, "-")}`
              }
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <Star className="w-3.5 h-3.5" />
            {starCount !== null ? formatStarCount(starCount) : "—"}
          </Link>
          <Link
            href="/signin"
            className="hidden md:inline-flex items-center justify-center rounded-full bg-primary px-5 py-1.5 text-sm font-semibold text-primary-foreground transition-colors duration-300 hover:bg-primary/90"
          >
            Get Started
          </Link>
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-4 right-4 rounded-2xl border border-border bg-background/90 backdrop-blur-xl p-4 shadow-2xl"
          >
            <nav className="flex flex-col space-y-4">
              {["Features", "How It Works", "Docs"].map((item) => (
                <Link
                  key={item}
                  href={
                    item === "Docs"
                      ? "/docs"
                      : `/#${item.toLowerCase().replace(/\s+/g, "-")}`
                  }
                  className="text-base font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Link
                href={`https://github.com/${GITHUB_REPO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-base font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Star className="w-4 h-4 mr-2" />
                Stars{" "}
                {starCount !== null ? `(${formatStarCount(starCount)})` : ""}
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
