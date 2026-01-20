import { Sidebar } from '@/components/dashboard/Sidebar';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth check (replaces middleware for Next.js 16)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/signin');
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
