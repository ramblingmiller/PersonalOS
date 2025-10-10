import { useState, useEffect, useRef } from 'react';
import { Search, X, File } from 'lucide-react';
import { searchFiles, searchContent } from '../../services/searchService';
import { FileMatch, ContentMatch } from '../../types/search';
import { useFileStore } from '../../stores/fileStore';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchTab = 'files' | 'content';

export function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>('files');
  const [query, setQuery] = useState('');
  const [fileResults, setFileResults] = useState<FileMatch[]>([]);
  const [contentResults, setContentResults] = useState<ContentMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectFile, files } = useFileStore();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setFileResults([]);
      setContentResults([]);
      return;
    }

    setIsSearching(true);

    const search = async () => {
      try {
        if (activeTab === 'files') {
          const results = await searchFiles(query);
          setFileResults(results);
        } else {
          const results = await searchContent(query);
          setContentResults(results);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(search, 300); // Debounce
    return () => clearTimeout(timer);
  }, [query, activeTab, isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectFile = (path: string) => {
    const file = files.find((f) => f.path === path);
    if (file) {
      selectFile(file);
      onClose();
    }
  };

  if (!isOpen) return null;

  const results = activeTab === 'files' ? fileResults : contentResults;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl h-2/3 flex flex-col border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Search
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('files')}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${activeTab === 'files'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${activeTab === 'content'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
          >
            Content
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-md px-3 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeTab === 'files'
                  ? 'Search file names...'
                  : 'Search file contents...'
              }
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
            />
            {isSearching && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Search className="w-12 h-12 mb-3" />
              <p className="text-sm">
                {activeTab === 'files'
                  ? 'Search for files by name'
                  : 'Search within file contents'}
              </p>
              <p className="text-xs mt-1">Press Ctrl+Shift+F to open search</p>
            </div>
          ) : results.length === 0 && !isSearching ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTab === 'files' ? (
                fileResults.map((result) => (
                  <button
                    key={result.path}
                    onClick={() => handleSelectFile(result.path)}
                    className="w-full flex items-start gap-3 p-3 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <File className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title || getFilename(result.path)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {result.path}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                contentResults.map((result, index) => (
                  <button
                    key={`${result.path}-${index}`}
                    onClick={() => handleSelectFile(result.path)}
                    className="w-full flex items-start gap-3 p-3 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <File className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title || getFilename(result.path)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                        {result.path}
                      </div>
                      <div
                        className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.snippet }}
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <span>
            {results.length > 0 && `${results.length} result${results.length === 1 ? '' : 's'}`}
          </span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}

function getFilename(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

