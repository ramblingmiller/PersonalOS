import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useFileStore } from './stores/fileStore';
import * as searchService from './services/searchService';

function App() {
  const initializeWithHome = useFileStore((state) => state.initializeWithHome);
  const isFileDirty = useFileStore((state) => state.isFileDirty);

  useEffect(() => {
    // Initialize the file system and search index sequentially
    (async () => {
      try {
        // First, initialize file system and wait for it to complete
        await initializeWithHome();
        
        // Now that file system is ready, initialize search index
        const dbPath = await searchService.initIndex();
        console.log('Search index initialized at:', dbPath);
        
        const currentDir = useFileStore.getState().currentDirectory;
        console.log('Current directory for indexing:', currentDir);
        
        if (currentDir) {
          // Index in background without blocking UI
          searchService.indexDirectory(currentDir)
            .then((count) => {
              console.log(`Indexed ${count} markdown files`);
            })
            .catch((error) => {
              console.error('Failed to index directory:', error);
            });
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    })();
  }, [initializeWithHome]);

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
