'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Logo from '../Logo';
import { Input } from '../ui/Input';
import Link from 'next/link';
import { FaGithub, FaGoogle } from 'react-icons/fa';

const RegisterComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await authClient.signUp.email({
        email,
        password,
        name: email.split('@')[0], // Use email prefix as name
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
      });
    } catch (err) {
      console.error('Google sign up failed:', err);
      setError('Failed to sign up with Google');
    }
  };

  const handleGitHubSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: 'github',
      });
    } catch (err) {
      console.error('GitHub sign up failed:', err);
      setError('Failed to sign up with GitHub');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="m-auto h-fit w-full max-w-sm overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md shadow-zinc-950/5"
    >
      <div className="p-6">
        <div className="flex items-center justify-center gap-1">
          <Link href="/" aria-label="go home" className="block w-fit">
            <Logo width={60} height={40} />
          </Link>
          <h1 className="text-lg font-semibold text-neutral-900">Create your account</h1>
        </div>

        {/* Fields */}
        <div className="mt-2 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Input id="email" type="email" label="Email" name="email" required />

          <Input id="password" type="password" label="Password" name="password" required />

          <Input
            id="confirm-password"
            type="password"
            label="Confirm Password"
            name="confirm-password"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg border border-neutral-300 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <hr className="border-dashed border-neutral-300" />
          <span className="text-muted-foreground text-xs">Or sign up with</span>
          <hr className="border-dashed border-neutral-300" />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
          >
            <FaGoogle className="h-4 w-4" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={handleGitHubSignUp}
            className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
          >
            <FaGithub className="h-4 w-4" />
            <span>GitHub</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 p-3">
        <p className="text-center text-sm text-neutral-700">
          Already have an account?
          <Link href="/login" className="ml-1 underline hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterComponent;
