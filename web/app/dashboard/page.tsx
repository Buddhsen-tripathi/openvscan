import Widget from './Widget';
import WelcomeBanner from './WelcomeBanner';

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-blue-600 mb-8">OpenVScan</h1>
        <nav>
          <ul>
            <li className="mb-4">
              <a href="/dashboard" className="font-bold text-blue-500">Dashboard</a>
            </li>
            <li className="mb-4">
              <a href="#" className="hover:text-blue-500">Scans</a>
            </li>
            <li className="mb-4">
              <a href="#" className="hover:text-blue-500">Reports</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-4 border-b">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <div>
            <span>Welcome, User!</span>
            {/* User Avatar will go here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
  <WelcomeBanner />

  {/* Add a grid for your widgets */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    <Widget title="Recent Scans">
      <p className="text-gray-500">No recent scans. Start one now!</p>
    </Widget>
    <Widget title="Onboarding Status">
      <p className="text-gray-500">Your profile is 75% complete.</p>
    </Widget>
    <Widget title="Quick Actions">
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        + New Scan
      </button>
    </Widget>
  </div>
</main>
      </div>
    </div>
  );
}