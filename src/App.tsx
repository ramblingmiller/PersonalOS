import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFileStore } from './stores/fileStore';
import * as searchService from './services/searchService';
import { listen } from '@tauri-apps/api/event';

function App() {
  const initializeWithHome = useFileStore((state) => state.initializeWithHome);
  const isFileDirty = useFileStore((state) => state.isFileDirty);

  // Initialize file system and database (non-blocking)
  useEffect(() => {
    initializeWithHome();
    searchService.initIndex().then((dbPath) => {
      console.log('Search database initialized at:', dbPath);
    }).catch((error) => {
      console.error('Failed to initialize search database:', error);
    });
  }, [initializeWithHome]);

  // Listen for indexing completion events from backend
  useEffect(() => {
    const setupListeners = async () => {
      const unlistenComplete = await listen<number>('indexing-complete', (event) => {
        console.log(`✅ Indexed ${event.payload} markdown files`);
      });

      const unlistenError = await listen<string>('indexing-error', (event) => {
        console.error('Indexing error:', event.payload);
      });

      return () => {
        unlistenComplete();
        unlistenError();
      };
    };

    let cleanup: (() => void) | null = null;
    setupListeners().then((fn) => {
      cleanup = fn;
    });

    return () => {
      if (cleanup) cleanup();
    };
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
