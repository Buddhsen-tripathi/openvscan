import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-white p-4 shadow-lg hidden md:block border-r border-gray-200">
      <h1 className="text-2xl font-bold text-blue-600 mb-8">
        <Link href="/dashboard">OpenVScan</Link>
      </h1>
      <nav>
        <ul>
          <li className="mb-4">
            <Link
              href="/dashboard"
              className="flex items-center text-gray-700 hover:text-blue-600 font-medium"
            >
              Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-blue-600">
              Scans
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-blue-600">
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
