import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginComponent from '@/components/auth/Login';

const Page = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      redirect('/dashboard');
    }
  } catch (error) {
    
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32">
      <LoginComponent />
    </section>
  );
};

export default Page;
