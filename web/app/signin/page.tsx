'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <section className="p-3 min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

      {/* Animated SVG Rings */}
      <div
        className="absolute inset-0 flex items-center justify-center blur-3xl pointer-events-none"
        style={{ opacity: 0.15 }}
      >
        <div className="w-[500px] h-[500px] bg-primary/20 rounded-full animate-pulse-slow" />
      </div>

      <div className="relative bg-background/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 w-full max-w-full sm:max-w-md px-6 py-8 sm:px-8 mx-auto text-center z-10 animate-fade-in-up">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg shadow-lg shadow-primary/20"
          />
          <h2 className="text-2xl font-bold text-foreground tracking-tight">OpenVScan</h2>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">Sign in to your account</h3>
        <p className="mb-8 text-sm text-muted-foreground">
          Continue to secure your code before it ships.
        </p>

        {/* Form */}
        <form
          className="space-y-5"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
          }}
        >
          <div>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email || ''}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={password || ''}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-0 bottom-0 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
              <input type="checkbox" className="accent-primary rounded border-input" />
              Remember me
            </label>
            <Link href="/forgot-password" className="hover:text-primary transition-colors">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 cursor-pointer transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <span className="w-full border-t border-border"></span>
          <span className="mx-3 text-xs text-muted-foreground font-medium">OR</span>
          <span className="w-full border-t border-border"></span>
        </div>

        {/* Other Auth Options */}
        <div className="flex gap-3 flex-col">
          <button className="w-full py-2.5 rounded-xl bg-background border border-input text-foreground font-medium hover:bg-muted/50 hover:border-primary/30 transition-all flex items-center justify-center gap-2 cursor-pointer group">
            <FaGithub className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/*  */}
        <p className="mt-8 text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}
