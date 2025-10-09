import { useFileStore } from '../../stores/fileStore';
import { FileTree } from './FileTree';
import { ChevronUp, Home, FilePlus, FolderPlus } from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const { currentDirectory, navigateToParent, initializeWithHome, createNewFile, createNewFolder } = useFileStore();
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;
    await createNewFile(newFileName);
    setNewFileName('');
    setShowNewFileInput(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createNewFolder(newFolderName);
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
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
        
        {/* New File/Folder Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewFileInput(!showNewFileInput)}
            disabled={!currentDirectory}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Create new file"
          >
            <FilePlus className="w-3.5 h-3.5" />
            New File
          </button>
          <button
            onClick={() => setShowNewFolderInput(!showNewFolderInput)}
            disabled={!currentDirectory}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Create new folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            New Folder
          </button>
        </div>
      </div>
      
      {/* New File Input */}
      {showNewFileInput && (
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFile();
              if (e.key === 'Escape') {
                setShowNewFileInput(false);
                setNewFileName('');
              }
            }}
            placeholder="filename.md"
            className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateFile}
              className="flex-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewFileInput(false);
                setNewFileName('');
              }}
              className="flex-1 px-2 py-1 text-xs bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* New Folder Input */}
      {showNewFolderInput && (
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') {
                setShowNewFolderInput(false);
                setNewFolderName('');
              }
            }}
            placeholder="folder-name"
            className="w-full px-2 py-1 text-sm border border-green-300 dark:border-green-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateFolder}
              className="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName('');
              }}
              className="flex-1 px-2 py-1 text-xs bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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

