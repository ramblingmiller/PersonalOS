import { useFileStore } from '../../stores/fileStore';
import { FileTree } from './FileTree';
import { ChevronUp, Home } from 'lucide-react';

export function Sidebar() {
  const { currentDirectory, navigateToParent, initializeWithHome } = useFileStore();

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Files
        </h2>
        <div className="flex gap-1">
          <button
            onClick={initializeWithHome}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Go to home directory"
          >
            <Home className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={navigateToParent}
            disabled={!currentDirectory}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Go to parent directory"
          >
            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Current Directory Path */}
      {currentDirectory && (
        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 truncate">
          {currentDirectory}
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        <FileTree />
      </div>
    </div>
  );
}

