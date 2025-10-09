import { useFileStore } from '../../stores/fileStore';
import { FileText, Loader2 } from 'lucide-react';

export function ContentPane() {
  const { selectedFile, fileContent, isLoading, error } = useFileStore();

  if (isLoading && selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <p className="text-sm text-gray-500">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error && selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Error Loading File
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <FileText className="w-16 h-16" />
          <p className="text-sm">Select a file to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* File Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {selectedFile.name}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
          {selectedFile.path}
        </p>
      </div>

      {/* File Content */}
      <div className="flex-1 overflow-auto p-6">
        <pre className="font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {fileContent}
        </pre>
      </div>
    </div>
  );
}

