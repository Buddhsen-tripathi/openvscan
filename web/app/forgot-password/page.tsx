'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { betterFetch } from '@better-fetch/fetch';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <h3 className="mb-2 text-xl font-semibold text-foreground">Reset your password</h3>
        <p className="mb-8 text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {/* Form */}
        <form
          className="space-y-5"
          autoComplete="off"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setSuccess(false);
            try {
              const { error } = await betterFetch('/api/auth/request-password-reset', {
                baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                method: 'POST',
                body: {
                  email,
                  redirectTo: '/reset-password',
                },
              });

              if (error) {
                setLoading(false);
                setError(error.message || 'An error occurred');
                return;
              }

              setLoading(false);
              setSuccess(true);
            } catch (err) {
              setLoading(false);
              setError('An unexpected error occurred.');
            }
          }}
        >
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-500 text-sm text-center bg-green-500/10 py-2 rounded-lg border border-green-500/20">
              Check your email for a reset link.
            </div>
          )}
          <div>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 cursor-pointer transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Sending Link…' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-8 text-xs text-muted-foreground">
          Remember your password?{' '}
          <Link
            href="/signin"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
