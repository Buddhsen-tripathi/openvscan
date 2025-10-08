'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import Logo from '../Logo';
import { Input } from '../ui/Input';
import Link from 'next/link';
import { FaGoogle, FaGithub } from 'react-icons/fa';

const LoginComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('pwd') as string;

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result && result.data) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Login failed - invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
      });
    } catch (err) {
      console.error('Google sign in failed:', err);
      setError('Failed to sign in with Google');
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'github',
      });
    } catch (err) {
      console.error('GitHub sign in failed:', err);
      setError('Failed to sign in with GitHub');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="m-auto h-fit w-full max-w-sm overflow-hidden rounded-md border border-neutral-200 bg-white shadow-md shadow-zinc-950/5 "
    >
      <div className="p-6">
        <div className="flex items-center justify-center gap-1">
          <Link href="/" aria-label="go home" className="block w-fit">
            <Logo width={60} height={40} />
          </Link>
          <h1 className="text-xl font-semibold text-neutral-900">Sign In to your account</h1>
        </div>

        <div className="mt-2 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Input id="email" type="email" label="Email" name="email" required />

          <Input id="pwd" type="password" label="Password" name="pwd" required />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full border border-neutral-300 px-4 py-2 text-primary-foreground rounded-lg bg-primary hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <hr className="border-dashed border-neutral-300" />
          <span className="text-muted-foreground text-xs">Or continue with</span>
          <hr className="border-dashed border-neutral-300 " />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
          >
            <FaGoogle className="h-4 w-4" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={handleGitHubSignIn}
            className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
          >
            <FaGithub className="h-4 w-4" />
            <span>GitHub</span>
          </button>
        </div>
      </div>

      <div className="border-t border-neutral-200 p-3 ">
        <p className="text-center text-sm text-neutral-700">
          Don&apos;t have an account?
          <Link href="/register" className="ml-1 underline hover:text-primary">
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginComponent;
