'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <section className="p-4 min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden py-8">
      {/* Animated SVG Rings */}
      <div className="absolute inset-0 flex items-center justify-center blur-sm pointer-events-none" style={{ opacity: 0.12 }}>
        <svg viewBox="0 0 200 200" width={500} height={500} className="w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] min-w-[280px] min-h-[280px]" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-primary)" strokeWidth="0.7" opacity="0.25" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.3" />
          <circle cx="100" cy="100" r="80" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="1" opacity="0.08"/>
        </svg>
      </div>
      
      <div className="absolute inset-0 bg-[linear-gradient(theme(colors.primary/0.01)_1px,transparent_1px),linear-gradient(90deg,theme(colors.primary/0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="relative bg-card rounded-2xl shadow-xl border border-primary/30 w-full max-w-full sm:max-w-md px-8 sm:px-8 py-6 md:py-8 mx-auto text-center z-10 animate-fade-in-up overflow-y-auto"
           style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-lg shadow shadow-primary/30" priority />
          <h2 className="text-2xl font-bold text-foreground">OpenVScan</h2>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-primary">Create your account</h3>
        <p className="mb-6 text-sm text-muted-foreground">Sign up to secure your code before it ships.</p>
        
        {/* Form */} 
        <form className="space-y-5" autoComplete="off" onSubmit={(e) => { e.preventDefault(); setLoading(true); }}>
          <div>
            <input 
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background border border-primary/20 focus:outline-none focus:border-primary text-foreground transition-all text-base"
            />
          </div>
          <div>
            <input 
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background border border-primary/20 focus:outline-none focus:border-primary text-foreground transition-all text-base"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background border border-primary/20 focus:outline-none focus:border-primary text-foreground transition-all pr-10 text-base"
            />
            <button
              type="button"
              className="absolute right-2 top-0 bottom-0 flex items-center px-2 text-muted-foreground hover:text-primary"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 font-semibold rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/40 hover:bg-primary/90 cursor-pointer transition-all text-base"
            disabled={loading}
          >
            {loading ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>

        <div className="my-3 flex items-center">
          <span className="w-full border-t border-primary/20"></span>
          <span className="mx-3 text-xs text-slate-700">OR</span>
          <span className="w-full border-t border-primary/20"></span>
        </div>

        {/* Other Auth Options */}
        <div className="flex gap-3 flex-row">
          <button className="w-full py-2 rounded-lg bg-card border border-border text-foreground font-semibold hover:bg-card-hover transition-all flex items-center justify-center gap-2 hover:cursor-pointer hover:bg-slate-200">
            <FaGoogle className="w-5 h-5 text-[#EA4335]" />
            <span className="inline xs:hidden">Google</span>
          </button>
          <button className="w-full py-2 rounded-lg bg-card border border-border text-foreground font-semibold hover:bg-card-hover transition-all flex items-center justify-center gap-2 hover:cursor-pointer hover:bg-slate-200">
            <FaGithub className="w-5 h-5" />
            <span className="inline xs:hidden">GitHub</span>
          </button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/signin" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
