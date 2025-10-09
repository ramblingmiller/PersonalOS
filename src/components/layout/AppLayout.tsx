import { Sidebar } from '../sidebar/Sidebar';
import { ContentPane } from './ContentPane';

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top Bar */}
      <header className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          PersonalOS
        </h1>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ContentPane />
      </div>
    </div>
  );
}

