'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import Image from 'next/image';
import { resetPassword } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  if (errorParam === 'INVALID_TOKEN') {
    return (
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold text-red-500">Invalid or Expired Token</h3>
        <p className="mb-8 text-sm text-muted-foreground">
          The password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block py-3 px-6 font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 cursor-pointer transition-all duration-300"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold text-red-500">Missing Token</h3>
        <p className="mb-8 text-sm text-muted-foreground">
          No reset token found. Please check your email link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block py-3 px-6 font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 cursor-pointer transition-all duration-300"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <>
      <h3 className="mb-2 text-xl font-semibold text-foreground">Set new password</h3>
      <p className="mb-8 text-sm text-muted-foreground">
        Please enter your new password below.
      </p>

      {/* Form */}
      <form
        className="space-y-5"
        autoComplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
          }
          setLoading(true);
          setError(null);
          setSuccess(false);
          try {
            await resetPassword({
              newPassword: password,
              token,
              fetchOptions: {
                onSuccess: () => {
                  setLoading(false);
                  setSuccess(true);
                  setTimeout(() => {
                    router.push('/signin');
                  }, 2000);
                },
                onError: (ctx) => {
                  setLoading(false);
                  setError(ctx.error.message);
                },
              },
            });
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
            Password reset successfully! Redirecting...
          </div>
        )}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="New Password"
            value={password}
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
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50 transition-all pr-10"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 cursor-pointer transition-all duration-300"
          disabled={loading || success}
        >
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
        
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordContent />
        </Suspense>

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
