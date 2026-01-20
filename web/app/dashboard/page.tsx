import Widget from './Widget';
import WelcomeBanner from './WelcomeBanner';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { CreateProjectButton } from '@/components/dashboard/CreateProjectButton';

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-4 border-b">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div>
          <span>Welcome, User!</span>
          {/* User Avatar will go here */}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <WelcomeBanner />

        <div className="flex justify-between items-center mt-8 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Your Projects</h3>
          <CreateProjectButton />
        </div>

        <ProjectList />
      </main>
    </>
  );
}
