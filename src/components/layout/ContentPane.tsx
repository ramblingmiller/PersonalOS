import { useFileStore } from '../../stores/fileStore';
import { MarkdownEditor } from '../editor/MarkdownEditor';
import { FileText, Loader2, Save } from 'lucide-react';

export function ContentPane() {
  const { selectedFile, fileContent, isLoading, error, isFileDirty, saveFile } = useFileStore();

  const handleSave = () => {
    saveFile();
  };

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

  if (fileContent === null) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <FileText className="w-16 h-16" />
          <p className="text-sm">No content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* File Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {selectedFile.name}
              {isFileDirty && (
                <span className="ml-2 text-red-500">*</span>
              )}
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            {selectedFile.path}
          </p>
        </div>
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!isFileDirty || isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
            transition-colors
            ${isFileDirty && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
          title="Save file (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <MarkdownEditor
          initialContent={fileContent}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
