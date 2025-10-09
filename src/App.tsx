import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFileStore } from './stores/fileStore';
import { getCurrentWebview } from '@tauri-apps/api/webview';

function App() {
  const initializeWithHome = useFileStore((state) => state.initializeWithHome);
  const isFileDirty = useFileStore((state) => state.isFileDirty);

  useEffect(() => {
    // Initialize the file system with the home directory on mount
    initializeWithHome();
  }, [initializeWithHome]);

  // Enable F12 to open devtools
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        try {
          const webview = getCurrentWebview();
          // Use internal toggle devtools
          await webview.internalToggleDevtools();
          console.log('Devtools toggled');
        } catch (error) {
          console.error('Failed to toggle devtools:', error);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Warn before closing with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFileDirty) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFileDirty]);

  return <AppLayout />;
}

export default App;
