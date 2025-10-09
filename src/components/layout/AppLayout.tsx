import { useState, useEffect } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { ContentPane } from './ContentPane';
import { MenuBar } from './MenuBar';
import { useFileStore } from '../../stores/fileStore';

export function AppLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const { selectedFile, isFileDirty, saveFile } = useFileStore();

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
  }, [selectedFile, isFileDirty, saveFile]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Debug: Tailwind Dark Mode Test */}
      <div className="hidden">
        <div className="bg-white dark:bg-black text-black dark:text-white">
          Tailwind Test
        </div>
      </div>
      
      {/* Menu Bar */}
      <MenuBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {isSidebarVisible && <Sidebar />}
        <ContentPane />
      </div>

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

