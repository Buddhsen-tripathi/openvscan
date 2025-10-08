import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import RegisterComponent from '@/components/auth/Register';

const SignupPage = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      redirect('/dashboard');
    }
  } catch (error) {
    // If session check fails, continue to register page
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32">
      <RegisterComponent />
    </section>
  );
};

export default SignupPage;

