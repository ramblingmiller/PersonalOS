import { useState, useEffect } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { ContentPane } from './ContentPane';
import { MenuBar } from './MenuBar';
import { CommandPalette } from '../common/CommandPalette';
import { SearchPanel } from '../search/SearchPanel';
import { useFileStore } from '../../stores/fileStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function AppLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPaletteMode, setCommandPaletteMode] = useState<'files' | 'commands'>('files');
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const { selectedFile, isFileDirty, saveFile } = useFileStore();
  const { canGoBack, canGoForward, goBack, goForward } = useNavigationStore();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Listen for menu actions
  useEffect(() => {
    const handleMenuAction = (event: CustomEvent<string>) => {
      const action = event.detail;
      
      switch (action) {
        case 'toggle-sidebar':
          setIsSidebarVisible(prev => !prev);
          break;
        case 'about':
          setShowAbout(true);
          break;
        case 'close-file':
          // Clear selected file
          if (selectedFile && !isFileDirty) {
            window.location.reload(); // Simple approach for now
          } else if (isFileDirty) {
            if (confirm('You have unsaved changes. Close anyway?')) {
              window.location.reload();
            }
          }
          break;
      }
    };

    window.addEventListener('menuaction', handleMenuAction as EventListener);
    return () => window.removeEventListener('menuaction', handleMenuAction as EventListener);
  }, [selectedFile, isFileDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+F for search panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchPanelOpen(true);
        return;
      }

      // Ctrl+P or Ctrl+Shift+P for command palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (e.shiftKey) {
          setCommandPaletteMode('commands');
        } else {
          setCommandPaletteMode('files');
        }
        setCommandPaletteOpen(true);
        return;
      }

      // Alt+Left/Right for navigation history
      if (e.altKey) {
        if (e.key === 'ArrowLeft' && canGoBack) {
          e.preventDefault();
          const prevPath = goBack();
          if (prevPath) {
            const file = useFileStore.getState().files.find((f) => f.path === prevPath);
            if (file) {
              useFileStore.getState().selectFile(file);
            }
          }
          return;
        } else if (e.key === 'ArrowRight' && canGoForward) {
          e.preventDefault();
          const nextPath = goForward();
          if (nextPath) {
            const file = useFileStore.getState().files.find((f) => f.path === nextPath);
            if (file) {
              useFileStore.getState().selectFile(file);
            }
          }
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            setIsSidebarVisible(prev => !prev);
            break;
          case 'n':
            e.preventDefault();
            const newFileEvent = new CustomEvent('menuaction', { detail: 'new-file' });
            window.dispatchEvent(newFileEvent);
            break;
          case 'w':
            if (selectedFile) {
              e.preventDefault();
              if (!isFileDirty || confirm('You have unsaved changes. Close anyway?')) {
                window.location.reload();
              }
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, isFileDirty, saveFile, canGoBack, canGoForward, goBack, goForward]);

  // Handle navigation history
  const handleGoBack = () => {
    const prevPath = goBack();
    if (prevPath) {
      const file = useFileStore.getState().files.find((f) => f.path === prevPath);
      if (file) {
        useFileStore.getState().selectFile(file);
      }
    }
  };

  const handleGoForward = () => {
    const nextPath = goForward();
    if (nextPath) {
      const file = useFileStore.getState().files.find((f) => f.path === nextPath);
      if (file) {
        useFileStore.getState().selectFile(file);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Menu Bar */}
      <div className="flex items-center">
        <MenuBar />
        {/* Navigation History Buttons */}
        <div className="flex items-center gap-1 pr-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleGoBack}
            disabled={!canGoBack}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Go Back (Alt+Left)"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleGoForward}
            disabled={!canGoForward}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Go Forward (Alt+Right)"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {isSidebarVisible && <Sidebar />}
        <ContentPane />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        mode={commandPaletteMode}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Search Panel */}
      <SearchPanel
        isOpen={searchPanelOpen}
        onClose={() => setSearchPanelOpen(false)}
      />

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAbout(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              PersonalOS
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              A desktop application combining AI-powered coding assistance with knowledge management.
            </p>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p><strong>Version:</strong> 0.1.0</p>
              <p><strong>Phase:</strong> 2 Complete (Markdown Editor)</p>
              <p><strong>Built with:</strong> Tauri, React, TypeScript, Rust</p>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

