import { useState, useEffect, useRef } from 'react';
import { 
  FilePlus, 
  FolderPlus, 
  Save, 
  PanelLeft, 
  Moon, 
  Sun,
  File,
  Command
} from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { searchFiles } from '../../services/searchService';
import { FileMatch } from '../../types/search';
import { fuzzyMatch } from '../../utils/fuzzy';

interface CommandPaletteProps {
  isOpen: boolean;
  mode: 'files' | 'commands';
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({ isOpen, mode, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fileResults, setFileResults] = useState<FileMatch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectFile, files, currentDirectory } = useFileStore();

  // Define available commands
  const commands: CommandItem[] = [
    {
      id: 'file.new',
      label: 'New File',
      icon: <FilePlus className="w-4 h-4" />,
      action: () => {
        const event = new CustomEvent('menuaction', { detail: 'new-file' });
        window.dispatchEvent(event);
      },
      keywords: ['create', 'new', 'file'],
    },
    {
      id: 'file.new-folder',
      label: 'New Folder',
      icon: <FolderPlus className="w-4 h-4" />,
      action: () => {
        const event = new CustomEvent('menuaction', { detail: 'new-folder' });
        window.dispatchEvent(event);
      },
      keywords: ['create', 'new', 'folder', 'directory'],
    },
    {
      id: 'file.save',
      label: 'Save File',
      icon: <Save className="w-4 h-4" />,
      action: () => {
        const { saveFile } = useFileStore.getState();
        saveFile();
      },
      keywords: ['save', 'write'],
    },
    {
      id: 'view.toggle-sidebar',
      label: 'Toggle Sidebar',
      icon: <PanelLeft className="w-4 h-4" />,
      action: () => {
        const event = new CustomEvent('menuaction', { detail: 'toggle-sidebar' });
        window.dispatchEvent(event);
      },
      keywords: ['sidebar', 'panel', 'toggle'],
    },
    {
      id: 'view.toggle-theme',
      label: 'Toggle Dark Mode',
      icon: document.documentElement.classList.contains('dark') ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      ),
      action: () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        }
      },
      keywords: ['theme', 'dark', 'light', 'mode'],
    },
  ];

  // Search for files when in file mode
  useEffect(() => {
    if (!isOpen || mode !== 'files') {
      setFileResults([]);
      return;
    }

    if (!query.trim()) {
      // Show current directory files when no query
      const currentFiles = files.filter((f) => !f.is_directory).slice(0, 10);
      const matches: FileMatch[] = currentFiles.map((f) => ({
        path: f.path,
        title: f.name,
        score: 0,
      }));
      setFileResults(matches);
      return;
    }

    const searchAsync = async () => {
      try {
        console.log('Searching files for:', query);
        const results = await searchFiles(query);
        console.log('Search results:', results);
        setFileResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setFileResults([]);
      }
    };

    const timer = setTimeout(searchAsync, 200); // Debounce
    return () => clearTimeout(timer);
  }, [query, mode, isOpen, files]);

  // Filter commands when in command mode
  const filteredCommands = mode === 'commands' && query
    ? commands.filter((cmd) => {
        const searchText = `${cmd.label} ${cmd.keywords?.join(' ') || ''}`.toLowerCase();
        return fuzzyMatch(query, searchText) > 0;
      }).sort((a, b) => {
        const scoreA = fuzzyMatch(query, a.label);
        const scoreB = fuzzyMatch(query, b.label);
        return scoreB - scoreA;
      })
    : commands;

  const results = mode === 'files' ? fileResults : filteredCommands;

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0) {
          handleSelectResult(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const handleSelectResult = (result: any) => {
    if (mode === 'files') {
      // Navigate to file
      const fileMatch = result as FileMatch;
      const file = files.find((f) => f.path === fileMatch.path);
      if (file) {
        selectFile(file);
      }
    } else {
      // Execute command
      const cmd = result as CommandItem;
      cmd.action();
    }
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-32 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === 'files'
                  ? 'Search files...'
                  : 'Search commands...'
              }
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
            />
            <span className="text-xs text-gray-500">
              {mode === 'files' ? 'Ctrl+P' : 'Ctrl+Shift+P'}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {query ? 'No results found' : mode === 'files' ? 'Type to search files' : 'Type to search commands'}
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={mode === 'files' ? (result as FileMatch).path : (result as CommandItem).id}
                onClick={() => handleSelectResult(result)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  ${index === selectedIndex ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                  transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0
                `}
              >
                {mode === 'files' ? (
                  <>
                    <File className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {(result as FileMatch).title || Path.basename((result as FileMatch).path)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {(result as FileMatch).path}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {(result as CommandItem).icon}
                    </span>
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                      {(result as CommandItem).label}
                    </span>
                  </>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <span>↑↓ Navigate • Enter Select • Esc Close</span>
        </div>
      </div>
    </div>
  );
}

// Helper to get basename
const Path = {
  basename: (path: string) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  },
};

